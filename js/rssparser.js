class RSSParser {
    constructor(stringToParse, current) {
        this._errorOccurred = false;
        try {
            let xml            = (new DOMParser()).parseFromString(stringToParse, 'text/xml');
            let type           = xml.evaluate(RSSParser.xPathType, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            this._title        = xml.evaluate(RSSParser.xPathTitle[type.localName], type, null, XPathResult.STRING_TYPE, null).stringValue;
            this._link         = xml.evaluate(RSSParser.xPathLink[type.localName], type, null, XPathResult.STRING_TYPE, null).stringValue;
            let items          = xml.evaluate(RSSParser.xPathItems[type.localName], type, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
            let currentToArray;
            try {
                currentToArray = JSON.parse(current);
            }
            catch (err) {
                currentToArray = [];
            }
            let currentLength  = currentToArray.length;
            let itemsLength    = items.snapshotLength;
            let itemsToArray   = new Array(itemsLength);
            this._newItemCount = 0;
            let itemDate, j, currentDate;
            for (let i = 0; i !== itemsLength; i++) {
                itemsToArray[i] = items.snapshotItem(i).textContent;
                itemDate        = moment(new Date(itemsToArray[i]));
                if (!itemDate.isValid()) {
                    if (objectInArray(itemsToArray[i], currentToArray) === -1)
                        this._newItemCount++;
                }
                else {
                    for (j = 0; j !== currentLength; j++) {
                        currentDate = moment(new Date(currentToArray[j]));
                        if (!currentDate.isValid()) {
                            if (currentToArray[j] === itemsToArray[i])
                                break;
                        }
                        else if (currentDate.isSame(itemDate))
                            break;
                    }
                    if (j === currentLength)
                        this._newItemCount++;
                }
            }
            if (this._newItemCount !== 0)
                this._newCurrent = JSON.stringify(itemsToArray);
        }
        catch (err) {
            this._errorOccurred = true;
        }
    }
    get errorOccurred() { return this._errorOccurred; }
    get title()         { return this._title;         }
    get link()          { return this._link;          }
    get newItemCount()  { return this._newItemCount;  }
    get newCurrent()    { return this._newCurrent;    }
}

RSSParser.xPathType  = '*[local-name()=\'rss\']/*[local-name()=\'channel\'] | *[local-name()=\'RDF\'] | *[local-name()=\'feed\']';
RSSParser.xPathTitle = { channel: '*[local-name()=\'title\']/text()', RDF: '*[local-name()=\'channel\']/*[local-name()=\'title\']/text()', feed: '*[local-name()=\'title\']/text()' };
RSSParser.xPathLink  = { channel: '*[local-name()=\'link\']/text()', RDF: '*[local-name()=\'channel\']/*[local-name()=\'link\']/text()', feed: '*[local-name()=\'link\']/@href' };
RSSParser.xPathItems = { channel: '*[local-name()=\'item\']/*[local-name()=\'pubDate\' or local-name()=\'title\' and not(../*[local-name()=\'pubDate\'])]/text()', RDF: '*[local-name()=\'item\']/*[local-name()=\'pubDate\' or local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()', feed: '*[local-name()=\'entry\']/*[local-name()=\'updated\']/text()' };
