
/*** SEARCH FUNCTION PROTOYPE ***/

//* Search Users and Project's prototype function
function SearchUP(data, object) {
    this.data       = data;
    this.status     = object.status || null;
    this.category   = object.ctg || null;
    this.location   = object.geo || null; 
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
    getAL: function() {
        var firstPart   = [],
            secondPart  = [],
            thirdPart   = [],
            fourthPart  = [],
            lastPart    = []
        
        var x;
        for(var i = 0; i < this.data.length; i++) {
            x = this.data[i]["location_city"] && this.data[i]["location_city"].toLowerCase().indexOf(this.location);
            y = this.data[i]["location_country"] && this.data[i]["location_country"].toLowerCase().indexOf(this.country);
            if (this.data[i]["about"] === this.about && x >= 0 && x !== null)
                firstPart.push(this.data[i]);
            else if (x >= 0 && x !== null)
                secondPart.push(this.data[i]);
            else if (this.data[i]["about"] === this.about)
                thirdPart.push(this.data[i]);
            else if (y >= 0 && y !== null)
                fourthPart.push(this.data[i])
            else
                lastPart.push(this.data[i]);
        };
        return [firstPart, secondPart, thirdPart, fourthPart, lastPart];
    }
};

//* Exports all prototype
module.exports = SearchUP;