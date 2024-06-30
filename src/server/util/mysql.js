import mysql from 'mysql2/promise';
import { Config } from './config.js';

class MySql {

  createPool(config = Config.mysql) {
    // 数据库连接配置
    // 创建连接池
    this.pool = mysql.createPool(config);
    return this.pool;
  }

  async insert(table, records) {
    // 插入数据
    if (records.length === 0) {
      return 0;
    }
    records.forEach((element) => {
      element.updatetime = (new Date()).getTime();
      element.updateuser = 1;
    });
    const columns = Object.keys(records[0]).join(', ');
    const placeholders = records.map(() => `(${Object.keys(records[0]).map(() => '?').join(', ')})`).join(', ');
    const values = records.flatMap(Object.values);
    const query = `INSERT INTO ${table} (${columns}) VALUES ${placeholders}`;
    try {
      const [result] = await this.pool.execute(query, values);
      console.log('Records inserted:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error inserting records:', error);
      return 0;
    }
  }

  // 删除数据
  async delete(table, conditions) {
    const conditionKeys = Object.keys(conditions);
    const conditionClauses = conditionKeys.map(key => `${key} = ?`).join(' AND ');
    const values = Object.values(conditions);
    const query = `DELETE FROM ${table} WHERE ${conditionClauses}`;
    try {
      const [result] = await this.pool.execute(query, values);
      console.log('Records deleted:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting record:', error);

    }
    return 0;
  }

  /**
   *  根据Ids删除数据
   * @param {*} table 
   * @param {*} ids 
   * @returns 
   */
  async deleteByIds(table, ids) {
    if (ids.length === 0) { return 0; }

    const placeholders = ids.map(() => '?').join(', ');
    const query = `DELETE FROM ${table} WHERE id IN (${placeholders})`;

    try {
      const [result] = await this.pool.execute(query, ids);
      console.log('Records deleted:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting records:', error);
    }
    return 0;
  }
  async deleteIn(table, field, ins) {
    if (ins.length === 0) { return 0; }
    const placeholders = ins.map(() => '?').join(', ');
    const query = `DELETE FROM ${table} WHERE ${field} IN (${placeholders})`;
    try {
      const [result] = await this.pool.execute(query, ins);
      console.log('Records deleted:', result.affectedRows);
      return result.affectedRows;
    } catch (error) {
      console.error('Error deleting records:', error);

    }
    return 0;
  }

  // 更新数据
  async update(table, data, conditions) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data)];

    const conditionKeys = Object.keys(conditions);
    const conditionClauses = conditionKeys.map(key => `${key} = ?`).join(' AND ');
    const conditionValues = Object.values(conditions);

    const query = `UPDATE ${table} SET ${setClause} WHERE ${conditionClauses}`;

    try {
      const [result] = await this.pool.execute(query, [...values, ...conditionValues]);
      console.log('Records updated:', result.affectedRows);
    } catch (error) {
      console.error('Error updating record:', error);
    }
  }

  /**查询数据 */
  async query(table, fieds = "*", conditions = {}, options = {}) {
    let query = `SELECT ${fieds || "*"} FROM ${table}`;

    // 构建 WHERE 子句
    if (Object.keys(conditions).length > 0) {
      const conditionClauses = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
      query += ` WHERE ${conditionClauses}`;
    }

    // 构建 ORDER BY 子句
    const orderBy = options.orderBy || '';
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }

    // 构建 LIMIT 子句
    const limit = options.limit || '';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    try {
      const values = Object.values(conditions);
      const [rows] = await this.pool.execute(query, values);
      console.log('Query results:', rows);
      return rows;
    } catch (error) {
      console.error('Error querying records:', error);
      throw error;
    }
  }


}

export default MySql;
