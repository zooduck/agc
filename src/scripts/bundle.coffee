debug = ->
	alert "Kermit"
	alert "Frog"
test = ->
	console.log "hallo console"
# This is a single line comment in CoffeeScript, this will not show when compiled to .js
### 
	This is a multiline comment in CoffeeScript
###
coffeeFunction = (arg1, arg2) ->
	false

coffeeF = ->
	console.log a if a == 1
	return