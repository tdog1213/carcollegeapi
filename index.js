const axios = require("axios")
const cheerio = require("cheerio")
const express = require("express")
const app = express()
app.listen(process.env.port || 3000)


app.get("/:page", (req, expResp) => {
    let page = req?.params?.page || "1"
    console.log(page)

    axios({
        method: "get",
        url: "https://carlislecollegestudentzone.com/page/"+page
    })
    .then(resp => {
        const $ = cheerio.load(resp.data)
    
        const finalData = {
            last10: [],
        }
    
        let currentPage = parseInt($("#infinite-container").find(".page-numbers.current").text())
    
    
        finalData["pagination"] = {
            "currentPage": currentPage,
            "baseURL": "https://carlislecollegestudentzone.com/page/",
            "nextPage": currentPage+1,
            "prevPage": currentPage-1 == 0 ?  null : currentPage-1
        }
    
        
        $("#infinite-container > .blog-holder").each((index, el) => {
            if (index < 10) {
                // Misc
                let headline = $(el).find(".headline").text().replace(/\s{3,}/gm, "   ")
                let date = $(el).find(".post-author").find(".organic-meta-post-date").text().replace(/Posted on /i, "").trimEnd()
                let author = "Carlisle College Student Zone"
    
                let article = []
                
                // Article content formatting
                $(el).find(".article > p").each((index, el) => {
                    article.push($(el).text().trim())
                })
                article = article.join("\n") || "[Image]"
    
    
                let obj = {
                    date,
                    headline,
                    author,
                    article,
                }
    
                // Push data
                finalData.last10.push(obj)
            }
    
        })
    
        expResp.json(finalData)
    
    })
    .catch(err => {
        let ERROR_REASON_ENUM = {
            404: "Invalid page",
            403: "You do not have access to this resource",
            429: "Ratelimited",
            400: "Malformed request"
        }
        return expResp.json({
            "error": true,
            "reason": ERROR_REASON_ENUM[err.response.status]
        })
    })
})