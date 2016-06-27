
/*** SEARCH FUNCTION PROTOYPE ***/

//* Search Users and Project's prototype function
function SearchUP(data, object) {
    this.data       = data;
    this.status     = object.status || null;
    this.category   = object.ctg || null;
    this.location   = object.geo || null;
    if (this.about === "Anything")
        this.about = null;
    else
        this.about      = object.about || null;
    this.country    = object.country || null
};

SearchUP.prototype  = {
    getSCL: function() {
        var firstPart = [], 
            secondPart = [],
            thirdPart = [],
            lastPart = []

        var x;
        for(var i = 0; i < this.data.length; i++) {
            x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
            if (this.data[i]["status"] === this.status && this.data[i]["category_name"] === this.category && x >= 0)
                firstPart.unshift(this.data[i]);
            else if (this.data[i]["status"] === this.status && x >= 0)
                firstPart.push(this.data[i]);
            else if (this.data[i]["category_name"] === this.category && x >= 0)
                secondPart.unshift(this.data[i]);
            else if(this.data[i]["status"] === this.status && this.data[i]["category_name"] === this.category)
                secondPart.push(this.data[i])
            else if (x >= 0)
                thirdPart.unshift(this.data[i]);
            else if (this.data[i]["status"] === this.status)
                thirdPart.push(this.data[i]);
            else if (this.data[i]["category_name"] === this.category)
                lastPart.unshift(this.data[i]);
            else
                lastPart.push(this.data[i]);
        };
        firstPart = firstPart.concat(secondPart, thirdPart, lastPart);
        return firstPart;
    },
    getALNew: function() {
        var firstPart   = [],
            secondPart  = [],
            thirdPart   = [],
            fourthPart  = [],
            fifthPart   = [],
            sixthPart   = [],
            seventhPart = [], 
            eightPart   = [],
            lastPart    = []
        
        console.log("OKKKKKK");
        if (this.about === null) {
            var x,
                y,
                ab;
            console.log(this.location);
            for(var i = 0; i < this.data.length; i++) {
                x = this.data[i].profiles["location_city"] && this.data[i].profiles["location_city"].toLowerCase().indexOf(this.location);
                y = this.data[i].profiles["location_country"] && this.data[i].profiles["location_country"].toLowerCase().indexOf(this.country);                
                if (x >= 0 && x !== null)
                    firstPart.push(this.data[i])
                else if (y >= 0 && y !== null)
                    secondPart.push(this.data[i])
                else
                    lastPart.push(this.data[i]);
            };
        } else if (this.location === null) {
            var x,
                y,
                ab;
            for(var i = 0; i < this.data.length; i++) {
                ab = this.data[i].profiles["about"] && this.data[i].profiles["about"].toLowerCase().indexOf(this.about);
                if (ab >= 0 && ab !== null)
                    firstPart.push(this.data[i]);
                else
                    lastPart.push(this.data[i]);
            };
        } else {
            var x,
                y,
                ab;
            for(var i = 0; i < this.data.length; i++) {
                x = this.data[i].profiles["location_city"] && this.data[i].profiles["location_city"].toLowerCase().indexOf(this.location);
                y = this.data[i].profiles["location_country"] && this.data[i].profiles["location_country"].toLowerCase().indexOf(this.country);
                ab = this.data[i].profiles["about"] && this.data[i].profiles["about"].toLowerCase().indexOf(this.about);
                if (ab >= 0 && ab !== null && x >= 0 && x !== null)
                    firstPart.push(this.data[i]);
                else if (ab >= 0 && ab !== null && y >= 0 && y !== null)
                    secondPart.push(this.data[i]);
                else if (ab >= 0 && ab !== null)
                    thirdPart.push(this.data[i]);
                else if (x >= 0 && x !== null)
                    fourthPart.push(this.data[i])
                else if (y >= 0 && y !== null)
                    fifthPart.push(this.data[i])
                else
                    lastPart.push(this.data[i]);
            };
        }

        if (!firstPart[0])
            firstPart.unshift("Casse toi tu trouveras rien!");
        else
            firstPart.unshift("Putin t'as trouve d'un coup, va au casino!");
        if (secondPart[0])
            secondPart.unshift("T'as la chance tu trouve au moin un truc!");
        if (thirdPart[0])
            thirdPart.unshift("Demerde toi avec ca");
        if (fourthPart[0])
            fourthPart.unshift("Je te souhaite une tres bon retour sur google");
        if (fifthPart[0])
            fifthPart.unshift("Tiens je t'envoie ce que j'ai");
        lastPart.unshift("Et le reste du monde, T'inquete c'est vaste");
        return [firstPart, secondPart, thirdPart, fourthPart, fifthPart, lastPart];
    },
    getAL: function() {
        var firstPart   = [],
            secondPart  = [],
            thirdPart   = [],
            fourthPart  = [],
            fifthPart   = [],
            sixthPart   = [],
            seventhPart = [], 
            eightPart   = [],
            lastPart    = []
        
        if (this.about === null) {
            var x,
                y,
                ab;
            for(var i = 0; i < this.data.length; i++) {
                x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
                y = this.data[i]["location_country"] && this.data[i]["location_country"].toLowerCase().indexOf(this.country);                
                if (x >= 0 && x !== null)
                    firstPart.push(this.data[i])
                else if (y >= 0 && y !== null)
                    secondPart.push(this.data[i])
                else
                    lastPart.push(this.data[i]);
            };
        } else if (this.location === null) {
            var x,
                y,
                ab;
            for(var i = 0; i < this.data.length; i++) {
                ab = this.data[i]["about"] && this.data[i]["about"].toLowerCase().indexOf(this.about);
                if (ab >= 0 && ab !== null)
                    firstPart.push(this.data[i]);
                else
                    lastPart.push(this.data[i]);
            };
        } else {
            var x,
                y,
                ab;
            for(var i = 0; i < this.data.length; i++) {
                x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
                y = this.data[i]["location_country"] && this.data[i]["location_country"].toLowerCase().indexOf(this.country);
                ab = this.data[i]["about"] && this.data[i]["about"].toLowerCase().indexOf(this.about);
                if (ab >= 0 && ab !== null && x >= 0 && x !== null)
                    firstPart.push(this.data[i]);
                else if (ab >= 0 && ab !== null && y >= 0 && y !== null)
                    secondPart.push(this.data[i]);
                else if (ab >= 0 && ab !== null)
                    thirdPart.push(this.data[i]);
                else if (x >= 0 && x !== null)
                    fourthPart.push(this.data[i])
                else if (y >= 0 && y !== null)
                    fifthPart.push(this.data[i])
                else
                    lastPart.push(this.data[i]);
            };
        }

        if (!firstPart[0])
            firstPart.unshift("Casse toi tu trouveras rien!");
        else
            firstPart.unshift("Putin t'as trouve d'un coup, va au casino!");
        if (secondPart[0])
            secondPart.unshift("T'as la chance tu trouve au moin un truc!");
        if (thirdPart[0])
            thirdPart.unshift("Demerde toi avec ca");
        if (fourthPart[0])
            fourthPart.unshift("Je te souhaite une tres bon retour sur google");
        if (fifthPart[0])
            fifthPart.unshift("Tiens je t'envoie ce que j'ai");
        lastPart.unshift("Et le reste du monde, T'inquete c'est vaste");
        return [firstPart, secondPart, thirdPart, fourthPart, fifthPart, lastPart];
    }
};

//* Exports all prototype
module.exports = SearchUP;

// function SearchUP(data, object) {
//     this.data       = data;
//     this.status     = object.status || null;
//     this.category   = object.ctg || null;
//     this.location   = object.geo || null;
//     this.about      = object.about || null
// };

// SearchUP.prototype  = {
//     getSCL: function() {
//         var firstPart = [],
//             secondPart = [],
//             thirdPart = [],
//             lastPart = []

//         var x;
//         for(var i = 0; i < this.data.length; i++) {
//             x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
//             if (this.data[i]["status"] === this.status && this.data[i]["category_name"] === this.category && x >= 0)
//                 firstPart.unshift(this.data[i]);
//             else if (this.data[i]["status"] === this.status && x >= 0)
//                 firstPart.push(this.data[i]);
//             else if (this.data[i]["category_name"] === this.category && x >= 0)
//                 secondPart.unshift(this.data[i]);
//             else if(this.data[i]["status"] === this.status && this.data[i]["category_name"] === this.category)
//                 secondPart.push(this.data[i])
//             else if (x >= 0)
//                 thirdPart.unshift(this.data[i]);
//             else if (this.data[i]["status"] === this.status)
//                 thirdPart.push(this.data[i]);
//             else if (this.data[i]["category_name"] === this.category)
//                 lastPart.unshift(this.data[i]);
//             else
//                 lastPart.push(this.data[i]);
//         };
//         firstPart = firstPart.concat(secondPart, thirdPart, lastPart);
//         return firstPart;
//     },
//     getAL: function() {
//         var firstPart = [],
//             lastPart = []

//         var x,
//             ab;
//         for(var i = 0; i < this.data.length; i++) {
//             x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
//             ab = this.data[i]["about"] === this.about
//             if (this.data[i]["about"] === this.about && x >= 0 && x !== null)
//                 firstPart.unshift(this.data[i]);
//             else if (x >= 0 && x !== null)
//                 firstPart.push(this.data[i]);
//             else if (this.data[i]["about"] === this.about)
//                 lastPart.unshift(this.data[i]);
//             else
//                 lastPart.push(this.data[i]);
//         };
//         firstPart = firstPart.concat(lastPart);
//         return firstPart;
//     }
// };

// //* Exports all prototype
// module.exports = SearchUP;