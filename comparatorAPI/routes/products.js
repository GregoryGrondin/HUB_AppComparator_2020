var express = require('express');
var router = express.Router();
var pg = require('pg');

const config = {
    user: 'postgres',
    database: 'postgres',
    password: 'password',
    host: process.env.DB_HOST,
    port: 5432
};

var client = new pg.Pool(config);

createTable("CREATE TABLE IF NOT EXISTS products(id serial PRIMARY KEY, name VARCHAR (250) NOT NULL, description VARCHAR (750) NOT NULL, vendor VARCHAR (100) NOT NULL, price VARCHAR (20) NOT NULL, tags VARCHAR (256) NOT NULL, image BYTEA)");


function createTable(table) {
    client.query(table, [], function (err, result) {
        if (err) {
            console.log(err.stack)
            createTable()
        }
    });
}

router.post('/register', function (req, res) {
    var insertQuery = "INSERT INTO products(name, description, vendor, price, tags) values($1, $2, $3, $4, $5)";
    var insertValues = [req.body.name.toLowerCase(), req.body.description, req.body.vendor.toLowerCase(), req.body.price, req.body.tags.toLowerCase()];
    client.query(insertQuery, insertValues, function(err, result) {
        if (err) {
            console.log(err)
            res.json({"status": "error", "data": {"state": "Internal error."}, "code": 500});
            return;
        } else {
            res.json({"status": "OK", "data": {"state": "Product registered successfully."}, "code": 201});
            return;
        }
    });
});

router.get('/dump', function(req, res) {
    client.query("SELECT * FROM products", [], function (err, result) {
        if (err) {
            console.log(err.stack);
            res.json({"status": "error", "data": {"state": "Internal error."}, "code": 500});
            return;
        } else {
            console.log(result.rows);
            res.json({"status": "OK", "data": result.rows, "code": 200});
        }
    })
});

router.get('/research', function(req, res) {
    var selectQuery = "SELECT * FROM products";
    var s = req.query.search.toLowerCase();
    s = s.replace("l'", "");
    s = s.replace("d'", "");
    s = s.replace("(", "");
    s = s.replace(")", "");
    s = s.replace("[", "");
    s = s.replace("]", "");
    s = s.replace("\"", "");
    s = s.replace(",", " ");
    s = s.replace(".", "");
    s = s.replace(":", "");
    s = s.replace("!", "");
    s = s.replace("?", "");
    var keywords = s.split(" ");
    keywords.filter(function(elem) {
        var rm = ["le", "la", "les", "de", "des", "du", "pour", "à", "au"];
        return (!rm.includes(elem))
    });
    client.query(selectQuery, [], function(err, result) {
        if (err) {
            console.log(err);
            res.json({"status": "error", "data": {"state": "Internal error."}, "code": 500});
            return;
        } else {
            var i = 0;
            var matchedProducts = [];
            var products = []
            var m = {}
            while (i < result.rows.length) {
                m = productMatches(result.rows[i], keywords, req.query.search)
                console.log(m)
                if (m.matches)
                matchedProducts.push({"product": result.rows[i], "matchInfo": m});
                i = i + 1;
            }
            products = req.query.filter === "price" ? sortProductsPrice(matchedProducts) : sortProductsRelevance(matchedProducts);
            res.json({"status": "OK", "data": products, "code": 201});
            return;
        }
    });
});

function productMatches(product, keywords, query) {
    var matchingKeywords = 0;
    var tags = product.tags.split(",");
    if (product.name === query.toLowerCase())
    return ({"matches": true, "matchesName": true, "matchesVendor": false, "matchesKeywords": 0});
    for (w in keywords) {
        if (tags.includes(keywords[w]))
        matchingKeywords = matchingKeywords + 1;
    }
    if (!tags.includes(product.vendor) && keywords.includes(product.vendor)) {
        return ({"matches": true, "matchesName": false, "matchesVendor": true, "matchingKeywords": matchingKeywords + 1});
    } else if (tags.includes(product.vendor) && keywords.includes(product.vendor)) {
        return ({"matches": true, "matchesName": false, "matchesVendor": true, "matchingKeywords": matchingKeywords})
    }
    return ({"matches": matchingKeywords > 0, "matchesName": false, "matchesVendor": false, "matchingKeywords": matchingKeywords});
}

function sortProductsRelevance(products) {
    var sortedProducts = [];
    var i = 0;
    for (p in products) {
        if (sortedProducts.length == 0 || (products[p].matchInfo.matchesVendor && products[p].matchInfo.matchingKeywords < 2)) {
            sortedProducts.push(products[p]);
            continue;
        }
        if (products[p].matchInfo.matchesName) {
            sortedProducts.unshift(products[p]);
            continue;
        }
        while (i < sortedProducts.length) {
            if (sortedProducts[i].matchInfo.matchingKeywords <= products[p].matchInfo.matchingKeywords && sortedProducts[i].matchInfo.matchesName == false) {
                sortedProducts.splice(i, 0, products[p]);
                break;
            }
            i = i + 1;
        }
        if (i == sortedProducts.length)
        sortedProducts.push(products[p]);
        i = 0;
    }
    return (sortedProducts);
}

function sortProductsPrice(products) {
    var sortedProducts = [];
    var i = 0;
    for (p in products) {
        while (i < sortedProducts.length) {
            if (parseFloat(sortedProducts[i].product.price) >= parseFloat(products[p].product.price)) {
                sortedProducts.splice(i, 0, products[p]);
                break;
            }
            i = i + 1;
        }
        if (i === sortedProducts.length)
        sortedProducts.push(products[p])
        i = 0;
    }
    return (sortedProducts);
}

createProducts([{
    "name": "Téléviseur LED 4K Philips",
    "description": "Ce téléviseur haut de gamme vous permettra de visionner vos meilleurs films et séries en haute définition",
    "vendor": "Philips",
    "price": "399.99",
    "tags": "téléviseur,hd,4k,philips,tv,télé,led"
}, {
    "name": "Téléviseur LCD 4K Samsung",
    "description": "Ce téléviseur haut de gamme vous permettra de visionner vos meilleurs films et séries en haute définition mais c'est samsung",
    "vendor": "Philips",
    "price": "449.99",
    "tags": "téléviseur,hd,4k,samsung,tv,télé,lcd"
}, {
    "name": "Télé d'occasion de Marc Philippe",
    "description": "Ce téléviseur haut de gamme vous permettra de visionner vos meilleurs films et séries en haute définition",
    "vendor": "Philippe Marc",
    "price": "139.99",
    "tags": "téléviseur,marcphilippe,tv,télé,occasion"
}, {
    "name": "Chaussures de sport Nike pour hommes",
    "description": "Ces chaussures de sport nike pour homme vous permettront de courir vite et loin pendant longtemps",
    "vendor": "Nike",
    "price": "59.89",
    "tags": "chaussure,chaussures,nike,homme,sport"
}, {
    "name": "Chaussures de course Adidas",
    "description": "Ces chaussures de sport nike pour homme vous permettront de courir vite et loin pendant longtemps",
    "vendor": "Nike",
    "price": "55.90",
    "tags": "chaussure,chaussures,course,adidas,sport"
}, {
    "name": "Kit de pêche",
    "description": "Ce kit de pêche vous permettra de pêcher les plus gros poissons.",
    "vendor": "La carpe molle",
    "price": "88.59",
    "tags": "canne,peche,pêche,poissons,gros,sport,kit"
}]);

async function createProducts(products) {
    var res = await client.query("SELECT * from products where name=$1", [products[0].name]);
    if (res.rows.length != 0)
        return;
    var insertQuery = "INSERT INTO products(name, description, vendor, price, tags) values($1, $2, $3, $4, $5)";
    for (p in products) {
        await client.query(insertQuery, [products[p].name, products[p].description, products[p].vendor, products[p].price, products[p].tags]);
    }
}

module.exports = router;
