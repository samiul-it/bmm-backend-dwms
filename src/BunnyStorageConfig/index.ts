import BunnyStorage from 'bunnycdn-storage';

// No region specified, defaults to Falkenstein (storage.bunnycdn.com)
export const bunnyStorage: any = new BunnyStorage(
  'e020d14a-c2f7-4a76-8978-72f22d54b363',
  'bmm-test',
);
// Specific region (ny.storage.bunnycdn.com)
export const bunnyStorageRegion: any = new BunnyStorage(
  'API-KEY',
  'STORAGE-ZONE-NAME',
  'ny',
);

// // list all files in zone / path
// const files = await bunnyStorage.list();
// const filesInDir = await bunnyStorage.list('/images');

// // upload a file from buffer or filename
// bunnyStorage.upload('/tmp/bunny.jpg');
// bunnyStorage.upload(fs.readFileSync('/tmp/bunny.jpg'), 'bunny.jpg');

// // download a file from the servers
// bunnyStorage.download('bunny.jpg'); // Buffer (default)
// bunnyStorage.download('bunny.jpg', 'arraybuffer'); // Buffer
// bunnyStorage.download('bunny.jpg', 'stream'); // ReadableStream

// // delete a file
// bunnyStorage.delete('bunny.jpg');
