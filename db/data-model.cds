namespace my.bookshop;

entity Books {
  key ID    : UUID    @Common.Label : 'ID' @ObjectModel.generator.UUID;
      title : String  @Common.Label : 'Title';
      stock : Integer @Common.Label : 'Stock';
}