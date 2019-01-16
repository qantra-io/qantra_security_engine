let staticExt = [
    //images
    "jpeg",
    "jpg",
    "gif",
    "png",
    "svg",
    //fonts
    "woff",
    "ttf",
    "otf",
    "eot",
    "woff2",
    //files
    "css",
    "js"
]


const extns = { 
    static: staticExt.map((x)=>{ return `.${x}`})
}


module.exports = extns;