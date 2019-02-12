module.exports = { 
    make: (pluginName, action, id)=>{
        return `${pluginName}::${action}::${id}`
    }
}