var DataManagerService = ['$http', '$rootScope', function($http, $rootScope){		

	var vaultLogPool,  vaults
	var addLogToPool

	vaultLogPool = {}//is this needed - might be for history play back
	vaults = []

	addLogToPool = function(log){		
		if(!vaultLogPool.hasOwnProperty(log.vault_id)){
			vaultLogPool[log.vault_id] = []
			vaults.push({vault_id:log.vault_id})						
			$rootScope.$apply()									
		}
		vaultLogPool[log.vault_id].push(log);
		notify(log)		
	}

	var notify = function(log){			
		$rootScope.$broadcast(log.vault_id, log)
		//$rootScope.$apply()			
	}

	var transformer = function(log){
		log.persona_id = parseInt(log.persona_id)
		log.action_id = parseInt(log.action_id)
		return log
	}

	var activeVaults = function(){
		$http.get('/vaults').then(function(result){
			var vaults = result.data
			for(var key in vaults){
				var logs = vaults[key].reverse()				
				for(var index in logs){
					addLogToPool(logs[index])
				}									
			}			
		})
	}


	var clearLogs = function(){
		$http.get('/clearLogs').then(function(){
			alert('Logs have been cleared.')
		});
	}

	this.getActiveVaults = activeVaults	
	this.vaults = vaults
	this.pushLog = addLogToPool
	this.clearLogs = clearLogs
}]