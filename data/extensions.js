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


module.exports = {

    staticExt: staticExt.map((x)=>{ return `.${x}`})
    
}