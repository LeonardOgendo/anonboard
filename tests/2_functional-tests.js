const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server.js");

chai.use(chaiHttp);

suite("Functional Tests", () => {
  suite("API ROUTING FOR /api/threads/:board", () => {
    test("POST => Create thread", (done) => {
      chai
        .request(server)
        .post("/api/threads/testboard")
        .send({ text: "Test thread", delete_password: "pass" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("GET => View recent threads", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          done();
        });
    });

    test("DELETE => Incorrect password", (done) => {
      chai
        .request(server)
        .post("/api/threads/testboard")
        .send({ text: "Thread to delete", delete_password: "correctpass" })
        .end((err, res) => {
          chai
            .request(server)
            .get("/api/threads/testboard")
            .end((err, res) => {
              const threadId = res.body[0]._id;
              chai
                .request(server)
                .delete("/api/threads/testboard")
                .send({ thread_id: threadId, delete_password: "wrongpass" })
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, "incorrect password");
                  done();
                });
            });
        });
    });

    test("DELETE => Correct password", (done) => {
      chai
        .request(server)
        .post("/api/threads/testboard")
        .send({ text: "Thread to delete", delete_password: "correctpass" })
        .end((err, res) => {
          chai
            .request(server)
            .get("/api/threads/testboard")
            .end((err, res) => {
              const threadId = res.body[0]._id;
              chai
                .request(server)
                .delete("/api/threads/testboard")
                .send({ thread_id: threadId, delete_password: "correctpass" })
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, "success");
                  done();
                });
            });
        });
    });

    // ✅ ✅ ✅ MOVED HERE
    test("PUT => Report thread", (done) => {
      chai
        .request(server)
        .post("/api/threads/testboard")
        .send({ text: "Thread to report", delete_password: "reportpass" })
        .end((err, res) => {
          chai
            .request(server)
            .get("/api/threads/testboard")
            .end((err, res) => {
              const threadIdToReport = res.body[0]._id;

              chai
                .request(server)
                .put("/api/threads/testboard")
                .send({ thread_id: threadIdToReport })
                .end((err, res) => {
                  assert.equal(res.status, 200);
                  assert.equal(res.text, "reported");
                  done();
                });
            });
        });
    });
  });

  suite("API ROUTING FOR /api/replies/:board", () => {
    test("POST => Create new thread to reply to", (done) => {
      chai
        .request(server)
        .post("/api/threads/testboard")
        .send({ text: "Reply target thread", delete_password: "replypass" })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    test("POST => Create reply", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          const threadId = res.body[0]._id;

          chai
            .request(server)
            .post("/api/replies/testboard")
            .send({
              thread_id: threadId,
              text: "This is a reply",
              delete_password: "replypass",
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              done();
            });
        });
    });

    test("GET => View single thread with replies", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          const threadId = res.body[0]._id;

          chai
            .request(server)
            .get("/api/replies/testboard")
            .query({ thread_id: threadId })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.isObject(res.body);
              assert.isArray(res.body.replies);
              done();
            });
        });
    });

    test("PUT => Report reply", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          const thread = res.body[0];
          const threadId = thread._id;

          const replyId = thread.replies[0]._id;

          chai
            .request(server)
            .put("/api/replies/testboard")
            .send({ thread_id: threadId, reply_id: replyId })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "reported");
              done();
            });
        });
    });

    test("DELETE => Incorrect password for reply", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          const thread = res.body[0];
          const threadId = thread._id;
          const replyId = thread.replies[0]._id;

          chai
            .request(server)
            .delete("/api/replies/testboard")
            .send({
              thread_id: threadId,
              reply_id: replyId,
              delete_password: "wrongpass",
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "incorrect password");
              done();
            });
        });
    });

    test("DELETE => Correct password for reply", (done) => {
      chai
        .request(server)
        .get("/api/threads/testboard")
        .end((err, res) => {
          const thread = res.body[0];
          const threadId = thread._id;
          const replyId = thread.replies[0]._id;

          chai
            .request(server)
            .delete("/api/replies/testboard")
            .send({
              thread_id: threadId,
              reply_id: replyId,
              delete_password: "replypass",
            })
            .end((err, res) => {
              assert.equal(res.status, 200);
              assert.equal(res.text, "success");
              done();
            });
        });
    });
  });
});
