const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const uri = 'mongodb://localhost:27017';

const client = new MongoClient(uri);

const SCHOOL_ID = new ObjectId('5f2987e020834114b8efd6f8');
const USER_ID = new ObjectId('0000d231816abba584714c9e');
const STORAGE_PROVIDER_ID = new ObjectId('62949a4003839b6162aa566b');
const BUCKET = 'bucket-5f2987e020834114b8efd6f8';
const NUM_HOMEWORKS = 500000;
const MAX_FILES_PER_TASK = 4;

function buildFile(creatorId, storageProviderId, bucket) {
  const file = { 
    securityCheck : {
        status : 'pending', 
        reason : 'not yet scanned', 
        requestToken : '0f888298-87c3-4315-aca1-77d36101a1d4', 
        createdAt : new Date(), 
        updatedAt : new Date(),
    }, 
    isDirectory : false,
    deleted : false, 
    name : 'test.txt',
    type : 'text/plain', 
    size : 1, 
    storageFileName : `${Date.now()}-test.txt`,
    storageProviderId: storageProviderId,
    thumbnail : `https://schulcloud.org/images/login-right.png`, 
    owner : creatorId, 
    refOwnerModel : 'user', 
    permissions : [
        {
            write : true, 
            read : true, 
            create : true, 
            delete : true, 
            refId : creatorId, 
            refPermModel : 'user'
        }
    ], 
    creator : creatorId, 
    bucket : bucket, 
    thumbnailRequestToken : 'c4d5a0aa-6916-4427-b673-0d1b973503a6',
    createdAt : new Date(), 
    updatedAt : new Date(), 
  };

  return file;
}

function buildTask(schoolId, teacherId, fileIds) {
  const task = { 
    schoolId : schoolId, 
    teacherId : teacherId, 
    name : `test-filesync-task-${Date.now()}`, 
    description : `description`,
    availableDate : new Date(), 
    dueDate : new Date(), 
    archived : [], 
    lessonId : null, 
    courseId : null, 
    updatedAt : new Date(), 
    createdAt : new Date(), 
    fileIds : fileIds, 
    maxTeamMembers : null, 
    private : false, 
    publicSubmissions : false, 
    teamSubmissions : false,
  };

  return task;
}

async function insertTaskWithFiles(db, schoolId, userId, storageProviderId, bucket) {
  const numFiles = Math.floor(Math.random() * (MAX_FILES_PER_TASK + 1));

  const files = [];

  for(let i = 0; i < numFiles; i+=1) {
    files.push(buildFile(userId, storageProviderId, bucket));
  }

  let fileIds = [];
  if (files.length > 0) {
    const resultFiles = await db.collection('files').insertMany(files);
    fileIds = Object.values(resultFiles.insertedIds);
  }

  const task = buildTask(schoolId, userId, fileIds);
  await db.collection('homeworks').insertOne(task);
}

async function run() {
  try {
    await client.connect();
    const db = client.db('schulcloud');

    for (let i = 0; i < NUM_HOMEWORKS; i+=1) {
      await insertTaskWithFiles(db, SCHOOL_ID, USER_ID, STORAGE_PROVIDER_ID, BUCKET);
    }

  } finally {
    await client.close();
  }
}
run().catch(console.dir);