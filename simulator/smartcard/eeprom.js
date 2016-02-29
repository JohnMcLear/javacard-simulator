module.exports = {
	/**
	 * Represents a smart cards EEPROM memory
	 * @param {string} cardName
	 */
	EEPROM: function(cardName) {
		this.cardName = cardName;
		this.packages = [];
		this.heap = [0xA0,0x00];
		this.installedApplets = [{'AID': [0xA0,0x00,0x00,0x00,0x62,0x03,0x01,0x08,0x01], 'appletRef': -1}];
		this.selectedApplet = {'AID': undefined, 'appletRef': undefined, 'CAP': undefined};
		this.objectheap = [];
	},

	/**
	 * @param  {EEPROM} EEPROM
	 * @return {string}
	 */
	getCardName: function(EEPROM){
		return EEPROM.cardName;
	},


	/**
	 * Pushes an object, or array of objects onto the object heap.
	 * @param  {EEPROM} EEPROM
	 * @param  {array/object} arr
	 */
	appendObjectHeap: function(EEPROM, arr) {
		if(arr.constructor === Array){//aprox 3 times quicker than instance of array
			EEPROM.objectheap.push.apply(EEPROM.heap, arr);
		} else {
			EEPROM.objectheap.push(arr);
		}
	},
	
	getAppletCAP: function(EEPROM, appletAID){
		for(var i = 0; i<EEPROM.packages.length; i++){
			for(var j = 0; j<EEPROM.packages[i].COMPONENT_Applet.applets.length; j++){
				if(EEPROM.packages[i].COMPONENT_Applet.applets[j].AID.join() === appletAID.join()){
					return EEPROM.packages[i];
				}
			}
		}
		return undefined;
	},
	getAppletHeap: function(EEPROM, appletAID){
		for(var i = 0; i<EEPROM.installedApplets.length; i++){
			if(EEPROM.installedApplets[i].AID.join() === appletAID.join()) {
				return EEPROM.installedApplets[i].heap;
			}
		}
		return undefined;
	},
	setSelectedApplet: function(EEPROM, appletAID){
		for(var i = 0; i<EEPROM.installedApplets.length; i++){
			if(EEPROM.installedApplets[i].AID.join() === appletAID.join()) {
				EEPROM.selectedApplet.AID =  EEPROM.installedApplets[i].AID;
				EEPROM.selectedApplet.appletRef = EEPROM.installedApplets[i].appletRef;
				EEPROM.selectedApplet.CAP = this.getAppletCAP(EEPROM, appletAID);
				return true;
			}
		}
		return false;
	},
	writePackage: function(EEPROM, capfile){
		EEPROM.packages[EEPROM.packages.length] = capfile;
	},
	getPackageByIndex: function(EEPROM, index){
		return EEPROM.packages[index];
	},
	getPackage: function(EEPROM, AID){
		//find the package with given AID and return it.
		for(var i = 0; i < EEPROM.packages.length; i++){
			if(EEPROM.packages[i].COMPONENT_Header.AID.join() === AID.join()){
				return EEPROM.packages[i];
			}
		}
	},

	setHeap: function(smartcard, pos, val){
		if(!smartcard.processor.transaction_flag){
			smartcard.EEPROM.heap[pos] = val;
		} else {
			smartcard.RAM.transaction_buffer.push([pos, val]);
		}
	},

	pushToHeap: function(smartcard, val){
		if(!smartcard.processor.transaction_flag){
			smartcard.EEPROM.heap.push(val);
		} else {
			smartcard.RAM.transaction_buffer.push(val);
		}
	},

	getObjectHeap: function(EEPROM){ return EEPROM.objectheap;},
	getObjectHeapValue: function(EEPROM, ref){ return EEPROM.objectheap[ref];}
};