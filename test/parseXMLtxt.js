var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var xmltxt='<collection><record><leader>02710cam a2200613 i 4500</leader><controlfield tag="001">22749068</controlfield><controlfield tag="005">20240314104957.0</controlfield><controlfield tag="008">220812t20222018enk      b    001 0 eng d</controlfield><datafield ind1=" " ind2=" " tag="010"><subfield code="a">  2017300331</subfield></datafield></record><record><leader>02710cam a2200613 i 4500</leader><controlfield tag="001">22749068</controlfield><controlfield tag="005">20240314104957.0</controlfield><controlfield tag="008">220812t20222018enk      b    001 0 eng d</controlfield><datafield ind1=" " ind2=" " tag="010"><subfield code="a">  123456</subfield></datafield></record></collection>';

var marcReader = new marcrecord.MarcXmlReader();
var records = marcReader.parseXMLtxt(xmltxt);

assert(records.length === 2);
assert(records[0].getSubfieldData('010', 'a') === '  2017300331');
assert(records[1].getSubfieldData('010', 'a') === '  123456');

console.error('OK');