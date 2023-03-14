namespace my.bookshop;

entity Books {
  key ID    : UUID    @Common.Label : 'ID'  @ObjectModel.generator.UUID;
  title     : String  @(
    title                           : 'Title',
    Common.ValueListWithFixedValues : false,
    Common.ValueList                : {
      CollectionPath : 'BookTitles',
      Parameters     : [{
        $Type             : 'Common.ValueListParameterInOut',
        LocalDataProperty : 'title',
        ValueListProperty : 'title'
      }]
    }
  );
  stock     : Integer @Common.Label : 'Stock' @validate.integer;
}

entity BookTitles {
  key title : String  @Common.Label : 'Title'  @searchable : true;
}