// https://docs.expo.dev/versions/latest/sdk/sqlite/
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('HappyTrails');

type User = {
    userId: string;
    email: string;
    trailName: string;
}

async function init() {
    await db.execAsync(`
       PRAGMA journal_mode = WAL;
       CREATE TABLE IF NOT EXISTS user (userId TEXT PRIMARY KEY NOT NULL, email TEXT NOT NULL, trailName TEXT);
    `);
}

async function create(userId: string, email: string, trailName: string) {
    // Prepared SQL statements escape arguments to defend against SQL injection attacks
    const insert = await db.prepareAsync('INSERT INTO user VALUES ($p1, $p2, $p3)');
    try {
        let result = await insert.executeAsync({$p1: userId, $p2: email, $p3: trailName});
        console.log(result.lastInsertRowId, result.changes)
    } finally {
        await insert.finalizeAsync();
    }
}

async function read(userId: string) {
    try {
        const result = await db.getFirstAsync<User>('SELECT * FROM user WHERE userId = ?', userId);
        console.log(result!.userId, result!.email, result!.trailName);
    } catch (error) {
        console.error('READ failed:', error)
    }
}

async function update(userId: string, email: string, trailName: string) {
    const fnUpdate = await db.prepareAsync('UPDATE user SET email = $p2, trailName = $p3 WHERE userId = $p1');
    try {
        await fnUpdate.executeAsync({$p1: userId, $p2: email, $p3: trailName});
    } catch (error) {
        console.error('UPDATE failed:', error);
    } finally {
        await fnUpdate.finalizeAsync();
    }
}

async function dbDelete(userId: string) {
    try {
        await db.runAsync('DELETE FROM user WHERE userId = ?', userId);
    } catch (error) {
        console.error('DELETE failed:', error);
    }   
}

export { create, dbDelete, init, read, update, User };
