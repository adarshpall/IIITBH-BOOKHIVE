import path from "path";
import fs from "fs";
import { ROOT_PATH } from "../server.js";

function deleteFile(filePath) {
    fs.unlink(path.join(ROOT_PATH, filePath),(err)=>{
        if(err){
            throw err;
        }
    });
}

export default deleteFile;