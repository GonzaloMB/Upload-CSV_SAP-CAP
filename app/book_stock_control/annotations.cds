using CatalogService as service from '../../srv/cat-service';

@odata.draft.enabled

annotate service.Books with @(
    UI.SelectionFields : [
        title,
        stock
    ],
    UI.LineItem        : [
        {
            $Type : 'UI.DataField',
            Value : title,
        },
        {
            $Type                     : 'UI.DataField',
            Value                     : stock,
            CriticalityRepresentation : #WithoutIcon,
            Criticality               : {$edmJson : {$If : [
                {$Le : [
                    {$Path : 'stock'},
                    100
                ]},
                1,
                {$If : [
                    {$Ge : [
                        {$Path : 'stock'},
                        500
                    ]},
                    3,
                    2
                ]}
            ]}}
        }
    ]
);

annotate service.Books with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data  : [
            {
                $Type : 'UI.DataField',
                Value : title,
            },
            {
                $Type : 'UI.DataField',
                Value : stock,
            },
        ],
    },
    UI.Facets                      : [{
        $Type  : 'UI.ReferenceFacet',
        ID     : 'GeneratedFacet1',
        Label  : 'General Information',
        Target : '@UI.FieldGroup#GeneratedGroup1',
    }, ]
) {
    ID         @(UI : {Hidden : true, });
};