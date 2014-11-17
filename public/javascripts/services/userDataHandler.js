app.provideFactory('userDataHandler', function ($resource, $q, appSettings) {

    var serverUserModel = appSettings.appLocation + appSettings.userModel;

    return $resource(appSettings.appLocation + appSettings.userModel + ':action/:id', { actId : '@action', id:'@id' }, {
        update: {method: 'PUT'},
        query: { method: 'GET', isArray:true },
        save: { method: 'POST' },
        remove: {method: 'DELETE'}
    }); 

});