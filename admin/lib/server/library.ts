import fsp from "mz/fs"
import * as fs from "fs";
import * as crypto from "crypto";

function findCachedData(path) {
    let hash = crypto.createHash('md5').update(path).digest("hex");
    let hashPath = "./cache/"+hash;
    if (fs.existsSync(hashPath)) {
        return JSON.parse(fs.readFileSync(hashPath).toString());
    }
    return undefined;
}

function cacheData(path,folderContents) {
    let hash = crypto.createHash('md5').update(path).digest("hex");
    let hashPath = "./cache/"+hash;
    let f = fs.openSync(hashPath,"w");
    fs.writeFileSync(f,JSON.stringify(folderContents));
    fs.closeSync(f);
}

async function getFolderContents(folderPath) {
    return fsp.readdir(folderPath);
}

export async function loadLocalLibrary(path) {
    let cachedData = findCachedData(path);
    if (cachedData) {
        return cachedData;
    }

    let folderContents = await getFolderContents(path);
    folderContents = folderContents.filter(f => fs.lstatSync(path+f).isDirectory())
    for (let i=0;i<folderContents.length;i++) {
        let artist = folderContents[i];
        let artistPath = path+artist+"/";
        let albums = (await getFolderContents(artistPath)).filter(f => fs.lstatSync(artistPath+f).isDirectory()).map(a => ({name:a}))
        folderContents[i] = {
            path:artistPath,
            artist,
            albums
        }
    }
    cacheData(path,folderContents);
    return folderContents;
}

export async function markAlbumAsLoaded(libraryPath,artist,album) {
    let lib:any[] = await loadLocalLibrary(libraryPath);
    for (let anEntry of lib) {
        if(anEntry.artist == artist) {
            for (let anAlbum of anEntry.albums) {
                if (anAlbum.name == album) {
                    anAlbum.saved = true;
                    cacheData(libraryPath,lib);
                    return;
                }
            }
        }
    }
}