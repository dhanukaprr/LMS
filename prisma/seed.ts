import { prisma } from '../lib/db';
import { hashPassword } from '../lib/auth';
import { indexCourseText } from '../lib/rag';
import fs from 'fs/promises';
import path from 'path';

async function main(){
  await prisma.chatMessage.deleteMany(); await prisma.discussionReply.deleteMany(); await prisma.discussionThread.deleteMany(); await prisma.lessonProgress.deleteMany(); await prisma.enrollment.deleteMany(); await prisma.materialChunk.deleteMany(); await prisma.resource.deleteMany(); await prisma.lesson.deleteMany(); await prisma.section.deleteMany(); await prisma.course.deleteMany(); await prisma.category.deleteMany(); await prisma.user.deleteMany();
  const passwordHash=await hashPassword('password123');
  const admin=await prisma.user.create({data:{name:'Admin User',email:'admin@example.com',passwordHash,role:'ADMIN'}});
  const lecturer=await prisma.user.create({data:{name:'Dr. Resource Person',email:'lecturer@example.com',passwordHash,role:'LECTURER'}});
  const student=await prisma.user.create({data:{name:'Student User',email:'student@example.com',passwordHash,role:'STUDENT'}});
  const business=await prisma.category.create({data:{name:'Business'}}); const marketing=await prisma.category.create({data:{name:'Marketing'}});
  const uploadDir=path.join(process.cwd(),'public','demo-materials'); await fs.mkdir(uploadDir,{recursive:true});
  async function createTxt(name:string, content:string){ const rel=`/demo-materials/${name}`; await fs.writeFile(path.join(process.cwd(),'public',rel),content); return rel; }
  const c1=await prisma.course.create({data:{title:'Introduction to Entrepreneurship',slug:'introduction-to-entrepreneurship',description:'Learn entrepreneurial mindset, opportunity discovery and business model basics with course-specific AI support.',outcomes:'Define entrepreneurship\nIdentify business opportunities\nCreate a simple business model canvas\nDiscuss early venture risks',level:'BEGINNER',isPublished:true,lecturerId:lecturer.id,categoryId:business.id}});
  const s11=await prisma.section.create({data:{title:'What is Entrepreneurship?',position:1,courseId:c1.id}}); const l111=await prisma.lesson.create({data:{title:'Entrepreneurship fundamentals',position:1,sectionId:s11.id,videoUrl:'demo-video-placeholder',content:'Entrepreneurship is the process of identifying opportunities, mobilising resources and creating value through new ventures or innovative projects. Entrepreneurs manage uncertainty and test assumptions through small experiments.'}});
  const s12=await prisma.section.create({data:{title:'Business Ideas and Opportunities',position:2,courseId:c1.id}}); await prisma.lesson.create({data:{title:'Opportunity recognition',position:1,sectionId:s12.id,content:'A business opportunity exists when a customer problem, market need, and feasible solution meet. Good opportunities are desirable, viable and feasible.'}});
  const s13=await prisma.section.create({data:{title:'Business Model Basics',position:3,courseId:c1.id}}); await prisma.lesson.create({data:{title:'Business model canvas',position:1,sectionId:s13.id,content:'A business model explains how a venture creates, delivers and captures value. Key elements include customer segments, value proposition, channels, revenue streams and cost structure.'}});
  const r1text='Entrepreneurship demo PDF resource: Entrepreneurs identify problems, validate ideas with customers, build minimum viable products, and refine business models. Opportunity evaluation should consider customer pain, market size, competition, revenue model and founder capability.';
  const r1path=await createTxt('entrepreneurship-demo-resource.txt',r1text); const r1=await prisma.resource.create({data:{courseId:c1.id,title:'Demo PDF Resource - Entrepreneurship Notes',fileName:'entrepreneurship-demo-resource.txt',filePath:r1path,mimeType:'text/plain'}});
  await indexCourseText(c1.id,`Lesson: ${l111.title}`,l111.content,undefined,l111.id); await indexCourseText(c1.id,`Resource: ${r1.title}`,r1text,r1.id);
  await prisma.discussionThread.create({data:{courseId:c1.id,authorId:student.id,title:'How do I validate a business idea?',body:'Should I start with surveys or interviews?'}});
  const c2=await prisma.course.create({data:{title:'Digital Marketing Fundamentals',slug:'digital-marketing-fundamentals',description:'Understand digital channels, social media marketing and SEO basics in a practical beginner course.',outcomes:'Explain digital marketing channels\nPlan social content\nUnderstand SEO fundamentals\nMeasure simple campaign performance',level:'BEGINNER',isPublished:true,lecturerId:lecturer.id,categoryId:marketing.id}});
  const s21=await prisma.section.create({data:{title:'Introduction to Digital Marketing',position:1,courseId:c2.id}}); const l211=await prisma.lesson.create({data:{title:'Digital marketing overview',position:1,sectionId:s21.id,content:'Digital marketing uses online channels such as search engines, social media, email and websites to attract, engage and convert audiences. Strategy starts with customer goals and measurable objectives.'}});
  const s22=await prisma.section.create({data:{title:'Social Media Marketing',position:2,courseId:c2.id}}); await prisma.lesson.create({data:{title:'Social media content basics',position:1,sectionId:s22.id,content:'Social media marketing requires audience research, content pillars, consistent posting, community engagement and campaign measurement.'}});
  const s23=await prisma.section.create({data:{title:'Search Engine Optimisation Basics',position:3,courseId:c2.id}}); await prisma.lesson.create({data:{title:'SEO fundamentals',position:1,sectionId:s23.id,content:'SEO improves visibility in organic search. Core areas include keyword research, technical optimisation, on-page content, internal linking and authority building.'}});
  const r2text='Digital marketing demo PPTX resource: SEO begins with search intent. On-page SEO should align page titles, headings, internal links and useful content. Social media campaigns should define audience, message, creative format and performance metrics.';
  const r2path=await createTxt('digital-marketing-demo-resource.txt',r2text); const r2=await prisma.resource.create({data:{courseId:c2.id,title:'Demo PPTX Resource - Digital Marketing Notes',fileName:'digital-marketing-demo-resource.txt',filePath:r2path,mimeType:'text/plain'}});
  await indexCourseText(c2.id,`Lesson: ${l211.title}`,l211.content,undefined,l211.id); await indexCourseText(c2.id,`Resource: ${r2.title}`,r2text,r2.id);
  await prisma.discussionThread.create({data:{courseId:c2.id,authorId:student.id,title:'What is the difference between SEO and social media?',body:'Which one should a small business start with?'}});
  await prisma.enrollment.createMany({data:[{userId:student.id,courseId:c1.id},{userId:student.id,courseId:c2.id}]});
  console.log('Seed complete:', {admin:admin.email, lecturer:lecturer.email, student:student.email});
}
main().finally(()=>prisma.$disconnect());
