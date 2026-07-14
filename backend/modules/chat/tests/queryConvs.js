import mongoose from 'mongoose';
import Conversation from '../../../models/Conversation.js';
import Message from '../../../models/Message.js';
import User from '../../../models/User.js';

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/staymate');
  console.log('Connected to MongoDB');

  const convs = await Conversation.find().populate('participants', 'name email');
  console.log(`Found ${convs.length} conversations:`);
  for (const c of convs) {
    console.log(`\nID: ${c._id}`);
    console.log(`Type: ${c.type}`);
    console.log(`Context: ${c.contextRef} (${c.contextId})`);
    console.log(`Participants: ${c.participants.map(p => p.email).join(', ')}`);
    
    const msgs = await Message.find({ conversationId: c._id });
    console.log(`Messages Count: ${msgs.length}`);
    msgs.forEach(m => {
      console.log(`  - [${m.isSystem ? 'SYSTEM' : m.senderId}] ${m.text}`);
    });
  }

  await mongoose.disconnect();
}

main().catch(console.error);
