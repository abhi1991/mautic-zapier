const should = require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('form triggers', () => {

  describe('new form submission trigger', () => {

    var subscribeData = null;

    it('should create a form submitted hook', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        targetUrl: 'http://provided.by?zapier',
        authData: {
          baseUrl: process.env.TEST_BASE_URL,
          username: process.env.TEST_BASIC_AUTH_USERNAME,
          password: process.env.TEST_BASIC_AUTH_PASSWORD
        }
      };

      appTester(App.triggers.formSubmitted.operation.performSubscribe, bundle)
        .then(response => {
          response.should.have.property('hook');
          response.hook.webhookUrl.should.eql(bundle.targetUrl);
          response.hook.id.should.be.greaterThan(0);
          response.hook.name.should.eql('Trigger Zapier about form submit events');
          response.hook.description.should.eql('Created via Zapier');
          response.hook.triggers.should.eql(['mautic.form_on_submit']);

          // Set subscribeDate for the unsubscribe test
          subscribeData = response;

          done();
        })
        .catch(done);

    });

    it('should delete the form submitted hook', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        targetUrl: 'http://provided.by?zapier',
        subscribeData: subscribeData,
        authData: {
          baseUrl: process.env.TEST_BASE_URL,
          username: process.env.TEST_BASIC_AUTH_USERNAME,
          password: process.env.TEST_BASIC_AUTH_PASSWORD
        }
      };

      // Delete the created hook to clean up after previous test and to test delete too
      appTester(App.triggers.formSubmitted.operation.performUnsubscribe, bundle)
        .then(response => {
          should.exist(response.hook);
          response.hook.webhookUrl.should.eql(bundle.targetUrl);
          response.hook.name.should.eql('Trigger Zapier about form submit events');
          response.hook.description.should.eql('Created via Zapier');
          response.hook.triggers.should.eql(['mautic.form_on_submit']);

          done();
        })
        .catch(done);

    });

    it('should load a submission via API', (done) => {
      const bundle = {
        authData: {
          baseUrl: process.env.TEST_BASE_URL,
          username: process.env.TEST_BASIC_AUTH_USERNAME,
          password: process.env.TEST_BASIC_AUTH_PASSWORD
        },
        inputData: {
          formId: 3,
        },
      };

      appTester(App.triggers.formSubmitted.operation.performList, bundle)
        .then(submissions => {

          var submission = submissions[0];

          submission.id.should.be.greaterThan(0);
          submission.formId.should.be.greaterThan(0);
          submission.should.have.property('formAlias');
          submission.should.have.property('formName');
          submission.should.have.property('dateSubmitted');
          submission.should.have.property('referrer');
          submission.should.have.property('page');
          submission.should.have.property('results');
          submission.should.have.property('contact');
          submission.results.should.not.be.empty();
          submission.contact.should.not.be.empty();
          submission.contact.id.should.be.greaterThan(0);

          done();
        })
        .catch(done);
    });

    it('should load submission from fake hook', (done) => {
      const bundle = {
        cleanedRequest: App.triggers.formSubmitted.operation.sample
      };

      appTester(App.triggers.formSubmitted.operation.perform, bundle)
        .then(submissions => {

          submissions.should.eql(
            [
              {
                id: 3,
                ip: '127.0.0.1',
                dateSubmitted: '2017-06-14T12:25:25+00:00',
                referrer: 'http://mautic.dev/index_dev.php/form/3',
                page: null,
                results: {
                  email: 'john.doe@atlas.cz',
                  country: 'Czech Republic',
                  f_select: 'option3',
                  checkbox: 'check2, check4'
                },
                contact: {
                  id: 50,
                  points: 0,
                  title: null,
                  firstname: null,
                  lastname: null,
                  company: null,
                  position: null,
                  email: 'john.doe@atlas.cz',
                  mobile: null,
                  phone: null,
                  fax: null,
                  address1: null,
                  address2: null,
                  city: null,
                  state: null,
                  zipcode: null,
                  country: 'Czech Republic',
                  preferred_locale: null,
                  attribution_date: null,
                  attribution: null,
                  website: null,
                  multiselect: null,
                  f_select: 'ddd',
                  boolean: null,
                  datetime: null,
                  timezone1: null,
                  facebook: null,
                  foursquare: null,
                  googleplus: null,
                  instagram: null,
                  linkedin: null,
                  skype: null,
                  twitter: null,
                  ownedBy: null,
                  ownedByUsername: null,
                  ownedByUser: null,
                  tags: ''
                },
                formId: 3,
                formName: 'various fields test',
                formAlias: 'various_fi'
              }
            ]
          );

          done();
        })
        .catch(done);
    });
  });
});
