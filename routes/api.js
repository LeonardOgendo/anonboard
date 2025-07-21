'use strict';

const Thread = require('../src/models/Thread.js');
const mongoose = require('mongoose');

module.exports = function (app) {

  // THREADS
  app.route('/api/threads/:board')

    // Create a new thread
    .post(async (req, res) => {
      const board = req.params.board;
      const { text, delete_password } = req.body;

      try {
        const now = new Date();
        const newThread = await Thread.create({
          board,
          text,
          delete_password,
          created_on: now,
          bumped_on: now,
          reported: false,
          replies: []
        });

        return res.redirect(`/b/${board}/`);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to create thread.' });
      }
    })

    // Get latest 10 threads with 3 replies each
    .get(async (req, res) => {
      const board = req.params.board;

      try {
        const threads = await Thread.find({ board })
          .sort({ bumped_on: -1 })
          .limit(10)
          .lean();

        const formatted = threads.map(thread => {
          const replies = (thread.replies || [])
            .sort((a, b) => b.created_on - a.created_on)
            .slice(0, 3)
            .map(reply => ({
              _id: reply._id,
              text: reply.text,
              created_on: reply.created_on
            }));

          return {
            _id: thread._id,
            text: thread.text,
            created_on: thread.created_on,
            bumped_on: thread.bumped_on,
            replies
          };
        });

        return res.json(formatted);
      } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to fetch threads.' });
      }
    })

    // Delete a thread
    .delete(async (req, res) => {
      const board = req.params.board;
      const { thread_id, delete_password } = req.body;

      try {
        const thread = await Thread.findById(thread_id);

        if (!thread || thread.board !== board) {
          return res.status(404).send('thread not found');
        }

        if (thread.delete_password !== delete_password) {
          return res.send('incorrect password');
        }

        await Thread.findByIdAndDelete(thread_id);
        return res.send('success');

      } catch (err) {
        console.error(err);
        return res.status(500).send('error deleting thread');
      }
    })

    // Report a thread
    .put(async (req, res) => {
      const { thread_id } = req.body;

      try {
        const thread = await Thread.findByIdAndUpdate(
          thread_id,
          { reported: true },
          { new: true }
        );

        if (!thread) return res.status(404).send('thread not found');

        return res.send('reported');
      } catch (err) {
        console.error(err);
        return res.status(500).send('error reporting thread');
      }
    });

  // REPLIES
  app.route('/api/replies/:board')

    // Add a reply
    .post(async (req, res) => {
      const { thread_id, text, delete_password } = req.body;

      try {
        const now = new Date();
        const thread = await Thread.findById(thread_id);

        if (!thread) return res.status(404).send('thread not found');

        const reply = {
          _id: new mongoose.Types.ObjectId(),
          text,
          delete_password,
          created_on: now,
          reported: false
        };

        thread.replies.push(reply);
        thread.bumped_on = now;

        await thread.save();

        return res.redirect(`/b/${thread.board}/${thread._id}`);
      } catch (err) {
        console.error(err);
        return res.status(500).send('error adding reply');
      }
    })

    // Get a thread with all replies
    .get(async (req, res) => {
      const { thread_id } = req.query;

      try {
        const thread = await Thread.findById(thread_id).lean();

        if (!thread) return res.status(404).send('thread not found');

        const replies = thread.replies.map(reply => ({
          _id: reply._id,
          text: reply.text,
          created_on: reply.created_on
        }));

        return res.json({
          _id: thread._id,
          text: thread.text,
          created_on: thread.created_on,
          bumped_on: thread.bumped_on,
          replies
        });

      } catch (err) {
        console.error(err);
        return res.status(500).send('error fetching replies');
      }
    })

    // Delete a reply (soft delete)
    .delete(async (req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;

      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('thread not found');

        const reply = thread.replies.id(reply_id);
        if (!reply) return res.status(404).send('reply not found');

        if (reply.delete_password !== delete_password) {
          return res.send('incorrect password');
        }

        reply.text = '[deleted]';
        await thread.save();

        return res.send('success');
      } catch (err) {
        console.error(err);
        return res.status(500).send('error deleting reply');
      }
    })

    // Report a reply
    .put(async (req, res) => {
      const { thread_id, reply_id } = req.body;

      try {
        const thread = await Thread.findById(thread_id);
        if (!thread) return res.status(404).send('thread not found');

        const reply = thread.replies.id(reply_id);
        if (!reply) return res.status(404).send('reply not found');

        reply.reported = true;
        await thread.save();

        return res.send('reported');
      } catch (err) {
        console.error(err);
        return res.status(500).send('error reporting reply');
      }
    });

};
