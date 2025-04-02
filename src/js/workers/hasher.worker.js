import { MD5, SHA1, SHA256, SHA512, lib } from "crypto-js";

self.onmessage = function(e) {
  const { fileData, algorithm } = e.data;
  
  try {
    const wordArray = lib.WordArray.create(new Uint8Array(fileData));
    
    let hash;
    switch(algorithm) {
      case 'SHA1': hash = SHA1(wordArray); break;
      case 'SHA256': hash = SHA256(wordArray); break;
      case 'SHA512': hash = SHA512(wordArray); break;
      default: hash = MD5(wordArray);
    }

    self.postMessage({
      success: true,
      hash: hash.toString()
    });

  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message
    });
  }
};
