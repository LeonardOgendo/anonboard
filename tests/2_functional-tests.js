const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let testThreadId;
let testReplyId;

suite('Functional Tests', function() {
  this.timeout(5000);

  suite('API ROUTING FOR /api/threads/:board', () => {

    test('POST => Create thread', done => {
      chai.request(server)
        .post('/api/threads/testboard')
        .send({
          text: 'Test thread',
          delete_password: 'pass123'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('GET => View recent threads', done => {
      chai.request(server)
        .get('/api/threads/testboard')
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          testThreadId = res.body[0]._id;
          done();
        });
    });

    test('DELETE => Incorrect password', done => {
      chai.request(server)
        .delete('/api/threads/testboard')
        .send({ thread_id: testThreadId, delete_password: 'wrongpass' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('DELETE => Correct password', done => {
      chai.request(server)
        .delete('/api/threads/testboard')
        .send({ thread_id: testThreadId, delete_password: 'pass123' })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });

  });

  suite('API ROUTING FOR /api/replies/:board', () => {

    test('POST => Create new thread to reply to', done => {
      chai.request(server)
        .post('/api/threads/testboard')
        .send({
          text: 'Thread for reply test',
          delete_password: 'replypass'
        })
        .end((err, res) => {
          done();
        });
    });

    test('GET => Get thread to fetch its id', done => {
      chai.request(server)
        .get('/api/threads/testboard')
        .end((err, res) => {
          testThreadId = res.body[0]._id;
          done();
        });
    });

    test('POST => Add reply to thread', done => {
      chai.request(server)
        .post('/api/replies/testboard')
        .send({
          thread_id: testThreadId,
          text: 'Test reply',
          delete_password: 'replypass'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test('GET => View thread with replies', done => {
      chai.request(server)
        .get('/api/replies/testboard')
        .query({ thread_id: testThreadId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body);
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          testReplyId = res.body.replies[0]._id;
          done();
        });
    });

    test('PUT => Report reply', done => {
      chai.request(server)
        .put('/api/replies/testboard')
        .send({ thread_id: testThreadId, reply_id: testReplyId })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
    });

    test('DELETE => Incorrect password for reply', done => {
      chai.request(server)
        .delete('/api/replies/testboard')
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'wrongpass'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
    });

    test('DELETE => Correct password for reply', done => {
      chai.request(server)
        .delete('/api/replies/testboard')
        .send({
          thread_id: testThreadId,
          reply_id: testReplyId,
          delete_password: 'replypass'
        })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
    });

    test('PUT => Report thread', done => {
        chai.request(server)
            .post('/api/threads/testboard')
            .send({ text: 'Thread to report', delete_password: 'reportpass' })
            .end((err, res) => {
            chai.request(server)
                .get('/api/threads/testboard')
                .end((err, res) => {
                const threadIdToReport = res.body[0]._id;

                chai.request(server)
                    .put('/api/threads/testboard')
                    .send({ thread_id: threadIdToReport })
                    .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.equal(res.text, 'reported');
                    done();
                    });
                });
            });
    });


  });

});
