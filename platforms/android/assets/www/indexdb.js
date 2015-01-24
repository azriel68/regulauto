/*
This file is part of Regulauto.

    Regulauto is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Regulauto is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>
  
    Author azriel68@gmail.com
 */


MyIndexedDB = {};

MyIndexedDB.open = function(dbname, callbackfct) {
	
  var version = 1;
  var request = indexedDB.open(dbname, version);

  request.onsuccess = function(e) {
  	MyIndexedDB.db = e.target.result;
    callbackfct();
    
  };
 
  request.onupgradeneeded = function (evt) { 
  		var db = evt.currentTarget.result;
  		        
        var objectStore = db.createObjectStore("speciale", 
                                     { keyPath: "id", autoIncrement: true });
 
        objectStore.createIndex("id", "id", { unique: true });
        objectStore.createIndex("label", "label", { unique: false });
               
   };

  request.onerror = MyIndexedDB.onerror;
 
};


MyIndexedDB.getAll= function(storename, TArray, callback) {
  var trans = MyIndexedDB.db.transaction(storename, IDBTransaction.READ_ONLY);
  var store = trans.objectStore(storename);
   
  TArray.splice(0,TArray.length);
  // Get everything in the store;
  var keyRange = IDBKeyRange.lowerBound(0);
  var cursorRequest = store.openCursor(keyRange);

  cursorRequest.onsuccess = function(e) {
    var result = e.target.result;
    if(result) {
    	
		TArray.push(result.value);
		result.continue();
    	
    }
    else{
    	
    	callback();
    }
      
	
  };

  cursorRequest.oncomplete = function() {
  	
  	
  };

  cursorRequest.onerror = MyIndexedDB.onerror;
};

MyIndexedDB.getNewId =function(storename) {
	return storename+'-'+Math.floor((1 + Math.random()) * 0x100000000)
               .toString(16)
               .substring(1)
               +'-'+Math.floor((1 + Math.random()) * 0x100000000)
               .toString(16)
               .substring(1);
};

MyIndexedDB.addItem = function(storename,item, callbackfct) {
  var trans = MyIndexedDB.db.transaction(storename, "readwrite");
  var store = trans.objectStore([storename]);
  store.delete(item.id);
  var request = store.put(item);

  trans.oncomplete = function(e) {
   	callbackfct(item);
  };

  request.onerror = function(e) {
    console.log(e.value);
  };
};

MyIndexedDB.deleteItem = function (storename, id, callbackfct) {
	var trans = MyIndexedDB.db.transaction(storename, "readwrite");
	var store = trans.objectStore([storename]);
	store.delete(id);
	
	trans.onsuccess = function(e) {
	   	if(callbackfct) callbackfct();
	};
	
	
};

MyIndexedDB.getItem = function (storename, id, callbackfct) {
	
	  var db = MyIndexedDB.db;
	  var trans = db.transaction(storename, "readwrite");
	  var store = trans.objectStore(storename);
	 
	  var request = store.get(id.toString()); 
	  request.onsuccess = function() {
		  var matching = request.result;
		  if (matching !== undefined) {
		    callbackfct(matching);
		  } else {
		    alert('Item not found');
		  }
	 };
	 
		
	
};


MyIndexedDB.clear=function() {
		var db = MyIndexedDB.db;
		db.close();
		
  		var req = indexedDB.deleteDatabase("regul");
		req.onsuccess = function () {
		    console.log("Deleted database successfully");
		};
		req.onerror = function () {
		    console.log("Couldn't delete database");
		};
		req.onblocked = function () {
		    console.log("Couldn't delete database due to the operation being blocked");
		};
	
};
