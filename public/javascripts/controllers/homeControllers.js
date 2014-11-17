app.controllerProvider('homeController', function ($scope, $timeout, $modal, userDataHandler) {

    // GET ALL USERS
    userDataHandler.query({ action: 'all' }, {}, function (data) {
        $scope.allUsers = data;
    });


    // REMOVE USER
    $scope.removeUser = function (userID) {

        userDataHandler.remove({ action: 'delete', id: userID }, {}, function (data) {

            // if user succesfuly removed, then remove him from $scope.
            if (data.status == 1) {
                for (i = 0; i < $scope.allUsers.length; i++) {
                    if (parseInt($scope.allUsers[i].id) == parseInt(userID)) {
                        $scope.allUsers.splice(i, 1);
                    }
                }

                // if status isn't 1 (success as defined in play -  display the error returned by play)
            } else {
                console.log(data.msg);
            }

        });
    }


    // ADD USER
    $scope.submitForm = function () {
        userDataHandler.save({ action: 'add' }, $scope.addUserForm, function (data) {
            if (data.status == 1) {

                // play returns the new user details , push it to $scope.AllUsers .
                $scope.allUsers.push({
                    "id": data.id,
                    "name": data.name,
                    "email": data.email,
                    "password": data.password
                });

                $scope.msgFromPlay = data.msg;

                $scope.addUserForm = {};

            } else {
                console.log(data.msg);
            }

        });
    }

    // use angular ui to open modal and recieve currentntly viewed user params
    $scope.updateModal = function (id, name, email, password) {

        var modalInstance = $modal.open({
            templateUrl: 'updateUserForm.html',
            controller: 'updateUserCtrl',
            resolve: {
                currUser: function () { return { "id": id, "name": name, "email": email, "password": password} },
                allUsers: function () { return $scope.allUsers }
            }
        });

    };

});


app.controllerProvider('updateUserCtrl', function ($scope, $modalInstance, currUser, allUsers, userDataHandler) {


    $scope.currUser = currUser;


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };


    // SUBMIT UPDATE USER
    $scope.submitForm = function () {

        userDataHandler.update({ action: 'update', id: $scope.currUser.id }, $scope.currUser, function (data) {

            if (data.status == 1) {

                $scope.allUsers = allUsers;

                // if update successful - remove old object from scope and add new one.
         
                for (i = 0; i < $scope.allUsers.length; i++) {
                    if (parseInt($scope.allUsers[i].id) == parseInt($scope.currUser.id)) {
                        $scope.allUsers.splice(i, 1);
                        $scope.allUsers.push($scope.currUser);
                        $modalInstance.dismiss('cancel');
                    }
                }

                // if status isn't 1 (success as defined in play -  display the error returned by play)
            } else {
                $scope.updateError = data.msg;
            }


        });
    }


});