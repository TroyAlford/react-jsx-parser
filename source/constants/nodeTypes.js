export default {
  ELEMENT:                1,
  TEXT:                   3,
  PROCESSING_INSTRUCTION: 7,
  COMMENT:                8,
  DOCUMENT:               9,
  DOCUMENT_TYPE:          10,
  DOCUMENT_FRAGMENT:      11,

  1:  'Element',
  3:  'Text',
  7:  'Processing Instruction',
  8:  'Comment',
  9:  'Document',
  10: 'Document Type',
  11: 'Document Fragment',

  /* Deprecated Nodes */
  ATTRIBUTE:            2,
  CDATA:                4,
  XML_ENTITY_REFERENCE: 5,
  XML_ENTITY:           6,
  XML_NOTATION:         12,

  2:  'Attribute (Deprecated)',
  4:  'CData (Deprecated)',
  5:  'XML Entity Reference (Deprecated)',
  6:  'XML Entity (Deprecated)',
  12: 'XML Notation (Deprecated)',
}
