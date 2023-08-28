const STAGES = {
    MENU: 'menu',
    AWAITING_USER: 'awaiting-user',
    AWAITING_SYSTEM_TYPE: 'awaiting-system-type',
    AWAITING_ORDER_NAME: 'awaiting-order-name',
    AWAITING_MEDIA_TYPE: 'awaiting-media-type',
    AWAITING_DESCRIPTION: 'awaiting-description',
};

const STAGESFROMMANUTENCION = {
    MENU: 'menu',
    AWAITING_USER: 'awaiting-user-manutencion',
    AWAITING_SYSTEM_TYPE: 'awaiting-system-type-manutencion',
    AWAITING_ORDER_NAME: 'awaiting-order-name-manutencion',
    AWAITING_MEDIA_TYPE: 'awaiting-media-type-manutencion',
    AWAITING_DESCRIPTION: 'awaiting-description-manutencion',
};



module.exports = { STAGES, STAGESFROMMANUTENCION };