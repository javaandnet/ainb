
import jsforce from 'jsforce';
// var conn = new jsforce.Connection();
import { Config } from './config.js';
import fetch64 from 'fetch-base64';
import { Util } from './util.js';
import mimetypes from "mime-types";
class JSH {
    constructor(x) {
        // this.conn = null;
    }

    login() {
        var me = this;
        var config = Config.sf;
        //.sf;
        //PWD+ResetToken
        return new Promise(function (resolve, reject) {
            if (me.conn != null) {
                resolve(me.conn);
            } else {
                let conn = new jsforce.Connection({ loginUrl: config.loginUrl });
                conn.login(config.userId, config.pwd, function (err, res) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        me.conn = conn;
                        resolve(conn);
                    }
                });
            }
        });
    }
    async find(objectName, condition, fields, limit = 1) {
        var me = this;
        if (me.conn == null) {
            await me.login();
        }
        var fieldsArr = fields.split(",");
        return new Promise((resolve, reject) => {
            const records = me.conn.sobject(objectName)
                .find(condition,
                    fieldsArr // fields can be string of comma-separated field names
                    // or array of field names (e.g. [ 'Id', 'Name', 'CreatedDate' ])
                )
                .sort(fieldsArr[0]) // if "-" is prefixed to field name, considered as descending.
                .limit(limit)
                .execute((err, records) => {
                    if (err) {
                        console.log(err);
                        resolve(null);
                    } else {
                        resolve(records);
                    }

                });
            //console.log(records);
        });
        return records;
    }


    async query(sql) {
        var me = this;
        if (me.conn == null) {
            await me.login();
        }

        return new Promise(function (resolve, reject) {
            me.conn.query(sql, function (err, res) {
                if (err) {
                    console.error(err);
                    resolve(err);
                } else {
                    resolve(res);
                }
            });
        });
    }

    async upload(file, fileName, fileId, folderId, libraryId) {
        var me = this;

        await me.login();
        try {
            //削除する
            if (fileId != "") {
                await me.delete("ContentDocument", { LatestPublishedVersionId: fileId });
            }
            //1. Insert ContentVersion.
            var file = await me.conn.sobject('ContentVersion').create({
                PathOnClient: fileName,
                FirstPublishLocationId: libraryId,
                VersionData: file.toString('base64')
            });
            //0680l000003V5qVAAS
            //2 Get DocumentId
            var document = await me.conn.sobject('ContentDocument').find({ LatestPublishedVersionId: file.id }, "Id");
            if (document.length == 0) {
                throw new Error('ERROR MOVE FOLDER');
            }
            //3.Get FolderMember 文件和文件夹关系
            var folder = await me.conn.sobject('ContentFolderMember').find({ ChildRecordId: document[0].Id }, "Id");
            if (folder.length == 0) {
                throw new Error('ERROR MOVE FOLDER');
            }
            //4. 更新关系至对应文件夹
            await me.conn.sobject('ContentFolderMember').update({ Id: folder[0].Id, ParentContentFolderId: folderId });
            return await Promise.resolve(file.id);
        } catch (e) {
            console.log(e);
            return await Promise.reject(e);
        }
        // }
    }
    //SELECT Id, ParentContentFolderId, Title FROM ContentFolderItem WHERE ParentContentFolderId = '07H0l0000004SS1EAM'
    /**
     * 
     * @param {*} Name 
     * @param {*} DeveloperName 
     * @param {*} Type 
     * @param {*} AccessType 
     * @param {*} ParentId
     * @returns 
     */
    async createFolder(folder) {
        var me = this;
        await me.login();
        return new Promise(function (resolve, reject) {
            me.conn.sobject('ContentFolder').create(folder).then(function (ret) {
                if (ret || !ret.success) {
                    console.error(ret);
                    reject(ret);
                } else {
                    resolve(ret);
                }
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    async update(objectName, rec) {
        var me = this;
        if (me.conn == null) {
            await me.login();
        }
        return await me.conn.sobject(objectName).update(rec);
    }

    async insert(objectName, rec) {
        var me = this;
        if (me.conn == null) {
            await me.login();
        }
        const ret = await me.conn.sobject(objectName).create(rec);
        //console.log(`Created record id : ${ret.id}`);
        return ret.id;
    }

    async delete(objectName, where) {
        var me = this;
        var util = new Util();
        await me.login();
        return new Promise(function (resolve, reject) {
            // DELETE FROM Account WHERE CreatedDate = TODAY
            if (util.isObject(where)) {
                me.conn.sobject(objectName)
                    .find(where)
                    .destroy(function (err, rets) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rets);
                        }
                    });
            } else {
                me.conn.sobject(objectName)
                    .del(function (err, rets) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(rets);
                        }
                    });
            }
        });
    }

    async upsert(objectName, obj) {
        var me = this;
        await me.login();
        return new Promise(function (resolve, reject) {
            // Single record upsert
            console.log(obj);

            if (typeof (obj.Id) == "undefined" || obj.Id == "" || obj.Id == "-1") {
                delete obj["Id"];
                me.conn.sobject(objectName).insert(obj, function (err, res) {
                    if (err) {
                        console.error(err);
                        resolve(err);
                    } else {
                        resolve(res);
                    }
                });
            } else {
                me.conn.sobject(objectName).update(obj, function (err, res) {
                    if (err) {
                        console.error(err);
                        resolve(err);
                    } else {
                        resolve(res);
                    }
                });
            }
        });
    }

    async retrieve(objectName, id) {
        var me = this;
        if (me.conn == null) {
            await me.login();
        }
        return new Promise(function (resolve, reject) {
            // Single record retrieval
            me.conn.sobject(objectName).retrieve(id, function (err, res) {
                if (err) {
                    //console.log(err);
                    resolve({ errorCode: err.errorCode });
                } else {
                    console.log("Name : " + res.Name);
                    resolve(res);
                }
            });
        });
    }
    async file(req, res, id) {
        var me = this;
        //id="0680l000003V5khAAC";
        await me.login();
        try {
            var files = await me.conn.sobject('ContentVersion').find({
                Id: id
            }, "Id,Title,FileExtension");

            if (files.length == 0) {
                throw new Error("NO DATA:" + id);
            } else {
                var title = files[0].Title;
                var ext = files[0].FileExtension;
                // var versionData = files[0].VersionData;
                const fileName = title;
                var fileMime = mimetypes.lookup("a." + ext);
                //fileMime = "image/svg+xml";
                // const fileMime = "jpg";
                res.set('Content-Type', fileMime);
                res.set('Content-Transfer-Encoding', 'binary');
                var url = config.loginUrl + 'services/data/v55.0/sobjects/ContentVersion/' + id + '/VersionData';
                const accessToken = me.conn.accessToken;
                const doFetchRemote = await fetch64.remote({
                    url: url,
                    headers: {
                        'Authorization': 'Bearer ' + accessToken
                    }
                });
                let decode = Buffer.from(doFetchRemote[0], 'base64');
                res.send(decode);
                me.conn.request(
                    url
                )
                    .then((result) => {
                        res.send(result);
                    });
            }
        } catch (e) {
            res.send("NO DATA");
        }
    }
}
//http://localhost:11117/sf/file/0680l000003V5r4AAC
export { JSH };
//http://160.16.216.251:11117/msg?type=1&to=SALESFORCE&msg=SALESFORCETEST
//http://160.16.216.251:11117/sf
//http://localhost:3000/sf/worker/a050l00000GQUk9AAH