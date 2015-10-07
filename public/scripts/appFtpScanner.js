angular.module('Module.ftp', ["ui.router"])
        .config(
                ['$stateProvider', '$urlRouterProvider',
                    function($stateProvider, $urlRouterProvider) {
                        $stateProvider
                                .state('ftpScanner', {
                                    url: '/ftps',
                                    templateUrl: 'views/ftpscanner/ftps.html',
                                    resolve: {
                                        deps: ['$ocLazyLoad', function($ocLazyLoad) {
                                                return $ocLazyLoad.load([
                                                    {
                                                        name: 'Module.ftp',
                                                        files: [
                                                            'scripts/services/ftp.js',
                                                        ]
                                                    },
                                                    'ui.bootstrap',
                                                    'ui.multiselect']);
                                            }]
                                    }
                                })
                    }
                ]
                )
//        .run(function(DTDefaultOptions) {
//            DTDefaultOptions.setLanguageSource('/translations/de_DE.json');
//        })
        .controller('ftpController', FilterFilesfromFtps)

function FilterFilesfromFtps($scope, Ftp, localStorageService) {
    var vm = this;
    vm.ftpFiles = [];
    vm.serverSelec = new Array();
    $scope.servers = [];
    $scope.filter = {}
    var ftpsSelectAux = localStorageService.get('ftpss');
    $scope.ftpsFilter = [];
    $scope.filterTable = function() {
        $scope.filter.type = 'file';
        $scope.filter.ftps = getIdSelected()
        Ftp.getAll($scope.filter, function(files) {
            vm.ftpFiles = files
        })
    }

    var init = 0;
    var updateListFTPS = function() {
        Ftp.getAll({type: 'ftps'}, function(ftps) {
            for (var i in ftps) {
                if (typeof ftps[i].name != 'undefined') {
                    vm.serverSelec[ftps[i]._id] = ftps[i]
                    $scope.servers.push(ftps[i])
                }
            }
            for (var i in ftpsSelectAux) {
                $scope.ftpsFilter.push(ftpsSelectAux[i])
            }
            init = 1;
            $scope.filterTable()
        })
    }
    updateListFTPS();

    $scope.$watch('ftpsFilter', function() {
        localStorageService.add('ftpss', $scope.ftpsFilter);
        if (init == 1) {
            $scope.filterTable()
        }
    });

    var getIdSelected = function() {
        var retorn = new Array()
        for (var i in $scope.ftpsFilter) {
            retorn.push($scope.ftpsFilter[i]._id)
        }
        return retorn;
    }
}

angular.module(AppName)
        .controller('ftpsCtrl', ftpsCtrl);
function ftpsCtrl($log, $modal, $scope, Ftp, Socket, Authentication) {
    var vm = this;
    vm.ftps = [];
    // datatables muy pesado
//    vm.dtOptions = DTOptionsBuilder.newOptions().withPaginationType('full_numbers').withDisplayLength(5).withBootstrap();
//    vm.dtColumnDefs = [
//        DTColumnDefBuilder.newColumnDef(0),
//        DTColumnDefBuilder.newColumnDef(1),
//        DTColumnDefBuilder.newColumnDef(2),
//        DTColumnDefBuilder.newColumnDef(3).notSortable()
//    ];
    Ftp.getAll({type: 'ftps'}, function(ftps) {
        vm.ftps = ftps
    })
    $scope.animationsEnabled = true;
    $scope.addFtpServer = function(size) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/ftpscanner/AddServerFtp.html',
            controller: 'ModalNewFTPCtrl',
            size: size
        });
        modalInstance.result.then(function(newftp) {
            Ftp.insertFtp(newftp, function(ftp) {
                vm.ftps.push(ftp)
            })
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
    $scope.updateFtp = function(ftp) {
        Ftp.insertFtp(ftp, function(ftp) {
            console.log('actualizado')
        })
    }

    $scope.toggleAnimation = function() {
        $scope.animationsEnabled = !$scope.animationsEnabled;
    };
    $scope.eliminarFtp = function(ftp) {
        bootbox.confirm("Desea eliminar realmente", function(result) {
            if (result) {
                Ftp.deleteFtp(ftp._id, function(result) {
                    var g = vm.ftps.indexOf(ftp);
                    vm.ftps.splice(g, 1);
                })
            }
        })
    }
    $scope.scannerFTP = function(ftp) {
        var modalInstance = $modal.open({
            animation: $scope.animationsEnabled,
            templateUrl: 'views/ftpscanner/FtpScannerView.html',
            controller: 'ModalScannerFTPCtrl',
            resolve: {
                ftp: function() {
                    return ftp;
                }
            }
        });
        modalInstance.result.then(function() {
        }, function() {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };
}

angular.module('Module.ftp').controller('ModalNewFTPCtrl', function($scope, $modalInstance) {
    $scope.ok = function() {
        $modalInstance.close($scope.ftp);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});
angular.module('Module.ftp').controller('ModalScannerFTPCtrl', function(ftp, $scope, $modalInstance, Socket) {
    $scope.ok = function() {
        $modalInstance.close($scope.ftp);
    };
    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
    $scope.logScanner = new Array();
    $scope.numFiles = 0;
    var socket = Socket.socket;
    socket.emit('scannerFtp', ftp, function() {
        console.log('escaneando ftp')
    });
    socket.on('logscanner', function(data) {
        $scope.$apply(function() {
            $scope.logScanner.push(data.newPaht)
            $scope.numFiles = data.num;
        })
    });
});