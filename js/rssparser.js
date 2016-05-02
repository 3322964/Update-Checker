class RssParser {
    constructor(stringToParse, previousDate) {
        this.errorFlag = false;
        try {
            let xml = (new DOMParser()).parseFromString(stringToParse, 'text/xml');
            let tmp = xml.evaluate(RssParser.xPathLink, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            let rssDate;
            if (tmp != null) {
                this.link  = tmp.textContent;
                this.items = xml.evaluate(RssParser.xPathItems, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                rssDate    = RssParser.xPathDate;
            }
            else {
                this.link  = xml.evaluate(RssParser.xPathLink2, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
                this.items = xml.evaluate(RssParser.xPathItems2, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                rssDate    = RssParser.xPathDate2;
            }
            this.name = xml.evaluate(RssParser.xPathTitle, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
            if (previousDate == '')
                this.newItemCount = this.items.snapshotLength;
            else {
                let length  = this.items.snapshotLength;
                let tmpDate = new Date(previousDate);
                if (!moment(tmpDate).isValid())
                    for (this.newItemCount = 0; this.newItemCount != length && xml.evaluate(rssDate, items.snapshotItem(this.newItemCount), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent != previousDate; this.newItemCount++) ;
                else for (this.newItemCount = 0; this.newItemCount != length && moment(new Date(xml.evaluate(rssDate, this.items.snapshotItem(this.newItemCount), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent)).isAfter(tmpDate); this.newItemCount++) ;
            }
            if (this.newItemCount != 0)
                this.newDate = xml.evaluate(rssDate, this.items.snapshotItem(0), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
        }
        catch (err) {
            this.errorFlag = true;
        }
    }
    getErrorFlag() {
        return this.errorFlag;
    }
    getLink() {
        return this.link;
    }
    getName() {
        return this.name;
    }
    getItems() {
        return this.items;
    }
    getNewItemCount() {
        return this.newItemCount;
    }
    getNewDate() {
        return this.newDate;
    }
}

RssParser.xPathTitle  = '//*[local-name()=\'title\' and (local-name(parent::*)=\'channel\' or local-name(parent::*)=\'feed\')]/text()';
RssParser.xPathLink   = '//*[local-name()=\'link\' and local-name(parent::*)=\'channel\']/text()';
RssParser.xPathLink2  = '//*[local-name()=\'link\' and local-name(parent::*)=\'feed\']/@href';
RssParser.xPathItems  = '//*[local-name()=\'item\']';
RssParser.xPathItems2 = '//*[local-name()=\'entry\']';
RssParser.xPathDate   = '*[local-name()=\'pubDate\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()';
RssParser.xPathDate2  = '*[local-name()=\'updated\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'updated\'])]/@href';
