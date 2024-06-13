import express from 'express';
import http from 'http';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { Server, Socket }  from 'socket.io';
import SF from './util/sf.js';
import cors from 'cors'
// import Azure   from './util/azure.cjs';
import {AI}   from './util/ai.js';


