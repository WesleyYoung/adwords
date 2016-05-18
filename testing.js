 /**
 * Created by wesleyyoung1 on 5/18/16.
 */
 var
     async = require('async'),
     expect = require('expect'),
     uuid = require('uuid');

 var clientCustomerId = "403-762-1647";

 process.env={

     ADWORDS_CLIENT_ID: '1029228575607-v1uo3r25s1q1hvm9crdj2cmirpq1ndb1.apps.googleusercontent.com',
     ADWORDS_SECRET: 'SkIeigyoNjTUAETvQbMBKLT3',
     ADWORDS_DEVELOPER_TOKEN: 'VobDWYcEt2llfXIAjOHDtg',
     ADWORDS_REFRESH_TOKEN: '1/22noNp0i70anuQmNuDbaSpjp7iftx-JFoVRmTsIV9dYMEudVrK5jSpoR30zcRFq6',
     ADWORDS_CLIENT_CUSTOMER_ID: clientCustomerId,
     ADWORDS_USER_AGENT: 'Bask AdWords',
     ADWORDS_TEST_ACCOUNT_ID: clientCustomerId

 };

 //describe('CampaignService', function() {
     var AdWords = require('googleads-node-lib');
     var factories = require('./node_modules/googleads-node-lib/tests/integration/factories');
     var budgetService = new AdWords.BudgetService();
     var service = new AdWords.CampaignService();

     //it('should provide a service description', function(done) {
         service.getClient(function(err, client) {
             expect(err).toNotExist();
             expect(service.description).toExist();
             //return done(err);
         });
     //});

     //it('should get campaigns', function(done) {
         var selector = new AdWords.Selector.model({
             fields: service.selectable,
             ordering: [{field: 'Name', sortOrder: 'ASCENDING'}]
         });

         service.get(
             process.env.ADWORDS_CLIENT_CUSTOMER_ID,
             selector,
             function(err, results) {
                 expect(err).toNotExist();
                 expect(results.entries).toExist();
                 //return done(err);
             }
         );
     //});

     //it('should create, set, and remove a campaign', function(done) {
         var budget = null;
         var campaign = null;

         async.series(
             [
                 // get a budget
                 function(cb) {
                     factories.budgetFactory({}, function(err, result) {
                         if (err) return cb(err);
                         budget = result;
                         return cb(err);
                     });
                 },
                 // add the campaign
                 function(cb) {
                     var operand = new service.Model({
                         name: 'TEST-' + uuid.v4(),
                         budget: {budgetId: budget.get('budgetId')},
                         advertisingChannelType: 'SEARCH',

                         biddingStrategyConfiguration: {
                             biddingStrategyName: uuid.v4(),
                             biddingStrategyType: 'MANUAL_CPC'
                         }
                     });

                     service.mutateAdd(
                         process.env.ADWORDS_TEST_ACCOUNT_ID,
                         operand,
                         function(err, results) {
                             expect(err).toNotExist();
                             expect(results.value).toExist();
                             expect(results.value.length).toEqual(1);
                             campaign = results.value.pop();
                             return cb(err, campaign);
                         }
                     );
                 },
                 // set campaign name
                 function(cb) {
                     var newName = 'TEST-' + uuid.v4();
                     console.log(campaign);
                     campaign.set('name', newName);

                     service.mutateSet(
                         process.env.ADWORDS_TEST_ACCOUNT_ID,
                         campaign,
                         function(err, results) {
                             expect(err).toNotExist();
                             expect(results.value).toExist();
                             expect(results.value.length).toEqual(1);
                             newCampaign = results.value.pop();
                             expect(newCampaign.get('name')).toEqual(newName);
                             return cb(err);
                         }
                     );
                 },
                 // remove campaign
                 function(cb) {
                     campaign.set('status', 'REMOVED');

                     service.mutateSet(
                         process.env.ADWORDS_TEST_ACCOUNT_ID,
                         campaign,
                         function(err, results) {
                             expect(err).toNotExist();
                             expect(results.value).toExist();
                             expect(results.value.length).toEqual(1);
                             return cb(err);
                         }
                     );
                 },
                 // clean up
                 function(cb) {
                     budgetService.mutateRemove(
                         process.env.ADWORDS_TEST_ACCOUNT_ID,
                         budget,
                         cb
                     );
                 }
             ],
             function(err, results) {
                 //done(err);
             }
         );
     //});
 //});