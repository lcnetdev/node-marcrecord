var assert = require('assert');

try {
  var marcrecord = require('marcrecord');
} catch (err) {
  var marcrecord = require('..');
}

var data = require('./data');

var MarcRecord = marcrecord.MarcRecord;
var MarcControlField = marcrecord.MarcControlField;
var MarcDataField = marcrecord.MarcDataField;
var MarcSubfield = marcrecord.MarcSubfield;

function create() {
  // Create new record.
  var record = new MarcRecord();
  assert(record.leader.length === 24 && record.size() === 0);

  // Create new control field.
  var controlField = new MarcControlField('001', 'ID/1');
  assert(controlField.tag === '001' && controlField.data === 'ID/1');

  // Add control field to the record.
  record.addVariableField(controlField);
  assert(record.size() === 1);

  // Create new data field.
  var dataField = new MarcDataField('900', '1', '2');
  assert(dataField.size() === 0 && dataField.tag === '900'
    && dataField.ind1 == '1' && dataField.ind2 == '2');

  // Add data field to the record.
  record.addVariableField(dataField);
  assert(record.size() === 2);

  // Create new subfield.
  var subfield = new MarcSubfield('a', 'Subfield data');
  assert(subfield.code === 'a' && subfield.data === 'Subfield data');

  // Add subfield to the data field.
  dataField.addSubfield(subfield);
  assert(dataField.size() === 1);

  // Create new embedded field.
  var embeddedField = new MarcControlField('001', 'ID/2');
  var subfield = new MarcSubfield('1', embeddedField);
  assert(subfield.code === '1' && subfield.data instanceof MarcControlField);

  // Add embedded field to the data field.
  dataField.addSubfield(subfield);
  assert(dataField.size() === 2);

}

function access() {
  var record = data.records[0];

  // Get control number.
  var controlNumber = record.getControlNumber();
  assert(controlNumber === 'ID/1');

  // Get fields.
  var fields = record.getVariableFields('001');
  assert(fields.length === 1 && fields[0].tag === '001');
  var fields = record.getVariableFields(/^90/);
  assert(fields.length === 2
    && fields[0].tag === '900' && fields[1].tag === '900');
  var fields = record.getControlFields(['001']);
  assert(fields.length === 1 && fields[0].tag === '001');
  var fields = record.getVariableFields();
  assert(fields.length === 4);
  var fields = record.getDataFields();
  assert(fields.length === 3);

  // Get single field.
  var field = record.getVariableField('001');
  assert(field && field.tag === '001');
  var field = record.getVariableField(/^95\d/);
  assert(field && field.tag === '950');

  // Get data fields with specified indicators.
  var fields = record.getDataFields('900', null, '4');
  assert(fields.length === 1 && fields[0].tag === '900'
    && fields[0].ind2 === '4');
  var fields = record.getDataFields([/^95/], '3', '4');
  assert(fields.length === 1 && fields[0].tag === '950'
    && fields[0].ind1 === '3' && fields[0].ind2 === '4');

  // Get control field data.
  var fieldData = record.getControlFieldData('001');
  assert(fieldData === 'ID/1');
  var fieldData = record.getControlFieldData('002');
  assert(fieldData === null);

  // Get subfields.
  var fields = record.getVariableFields('900');
  var subfields = fields.length > 0 ? fields[0].getSubfields('a') : [];
  assert(subfields.length === 1 && subfields[0].code === 'a');

  // Get subfield data.
  var fields = record.getVariableFields('900');
  var subfieldData = fields.length > 0 ? fields[0].getSubfieldData('a') : null;
  assert(subfieldData === 'A');
  var fields = record.getVariableFields(['959', /^95.$/]);
  var subfieldData = fields.length > 0 ? fields[0].getSubfieldData('b') : null;
  assert(subfieldData === 'B');
  var subfieldData = record.getSubfieldData('950', 'c');
  assert(subfieldData === 'C');
  var subfieldData = record.getSubfieldData([/950/], 'b');
  assert(subfieldData === 'B');

  // Get embedded fields.
  var field = record.getVariableField('950');
  assert(field);
  var embeddedFields = field.getVariableFields(['001', /90[5]/]);
  assert(embeddedFields.length === 3);

  // Get single embedded field.
  var field = record.getVariableField('950');
  assert(field);
  var embeddedField = field.getVariableField('905');
  assert(embeddedField && embeddedField.subfields.length === 2);
  var embeddedField = field.getVariableField([/^9/]);
  assert(embeddedField && embeddedField.subfields.length === 2);

  // Get control embedded fields and data.
  var field = record.getVariableField('950');
  assert(field);
  var embeddedControlNumber = field.getControlFieldData('001');
  assert(embeddedControlNumber === '2');
  var embeddedControlNumberField = field.getControlNumberField('001');
  assert(embeddedControlNumberField
    && embeddedControlNumberField.data === '2');
  var embeddedControlNumber = field.getControlNumber();
  assert(embeddedControlNumber === '2');
}

function modify() {
  var record = data.records[0];

  // Create the record copy.
  var recordCopy = new MarcRecord(record);
  assert(record.equals(recordCopy));

  // Add a field to the copy record and remove it right away.
  var field = new MarcControlField('009', 'Control field');
  record.addVariableField(field);
  record.removeVariableField(field);
  assert(record.equals(recordCopy));
}

function sort() {
  var record = data.records[1];

  // Sort the fiels.
  record.sort();
  assert(record.fields[0].tag === '001' && record.fields[1].tag === '100');

  // Sort the subfields.
  var field = record.getVariableField('100');
  field.sort();
  assert(field.subfields[0].code === 'a' && field.subfields[1].code === 'b');
}

function parse() {
  var record = data.records[0];

  // Create the record from JSON string.
  var recordCopy = marcrecord.parse(JSON.parse(JSON.stringify(record)));
  assert(record.equals(recordCopy));
}

create();
access();
modify();
sort();
parse();

console.error('OK');
