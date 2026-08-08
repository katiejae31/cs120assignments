/* Assignment 10, Part 2
   Katie Flanagan
*/

// function that does the bulk of the work, takes database as input
function run(db, collection)
{
var http = require('http');
var url = require('url');
var collection = db.collection('places');
http.createServer(async function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var pobj = url.parse(req.url, true);
    path = pobj.pathname
    if (path == '/')
    {
        res.write("<h1>Home</h1>");
        s = "<form method='get' action='/process'>";
        s += "Enter a city name or zip code: <input type='text' name='location'>";
        s += "<input type='submit'>";
        s += "</form>";
        res.write(s);
    }
    else if (path == '/process')
    {
        //console.log("went to process successfully");
        res.write("<h1>Looking up your location...</h1>");
        var loc = pobj.query.location;
        var theQuery = {};
        // checking if number or city name
        if (isNaN(loc))
        {
            res.write("<p>Searching by city name...</p>");
            // making search case insensitive
            theQuery = { place: { $regex: "^" + loc + "$", $options: "i" } };
        } else
        {
            res.write("<p>Searching by zip code...</p>");
            theQuery = {zips: loc};
        }
        //console.log("sending query to MongoDB");
        try {
            var zipsArr = await collection.find(theQuery).toArray();
            //console.log("mongodb eval finished. results found");
            if (zipsArr.length > 0)
            {
                for (var i = 0; i < zipsArr.length; i++) 
                { 
                    console.log("City: " + zipsArr[i].place);
                    console.log("Zip Codes: " + zipsArr[i].zips.join(', '));
                    res.write("<h2>City: " + zipsArr[i].place + "</h2>");
                    res.write("<h3>Zip Codes: " + zipsArr[i].zips.join(', ') + "</h3>");
                    res.write("<a href='/'>Search Again!</a>");
                }     
            } else {
                console.log("No matching locations found.");
                res.write("No matching locations found.");
                res.write("<a href='/'>Go Back</a>");
            }
        } catch (err) {
            console.log("Error during collection find: " + err);
            res.write("<p>An error occurred fetching records.</p>");   
        }
            res.end(); 
    }
    else
    {
        res.write("<h1>Page not found</h1>");
        res.end();
    }

    }).listen(process.env.PORT || 8080);
}

// Connection code taken from MongoDB after shorter method shown in class did not work
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://kflana03:assignment10@cluster0.do7ktt0.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function main() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    const db = client.db("cityZips");
    const collection = db.collection("places");
    run(db, collection);
  } catch (error) {
    console.dir(error);
    await client.close();
  }
}
main().catch(console.dir);

