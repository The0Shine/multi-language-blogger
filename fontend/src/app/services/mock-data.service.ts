// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import {
//   User,
//   Role,
//   Language,
//   Post,
//   Comment,
//   Category,
//   CategoryPost,
//   PostWithDetails,
//   CommentWithNesting,
// } from '../models/database.model';
// @Injectable({
//   providedIn: 'root',
// })
// export class MockDataService {
//   // Mock Data
//   private roles: Role[] = [
//     {
//       roleid: 1,
//       name: 'admin',
//       status: 1,
//       description: 'Administrator role',
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       roleid: 2,
//       name: 'authuser',
//       status: 1,
//       description: 'Authenticated user role',
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//   ];

//   private languages: Language[] = [
//     {
//       languageid: 1,
//       language_name: 'English',
//       locale_code: 'en_US',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       languageid: 2,
//       language_name: 'Vietnamese',
//       locale_code: 'vi_VN',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       languageid: 3,
//       language_name: 'French',
//       locale_code: 'fr_FR',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//   ];

//   private users: User[] = [
//     {
//       userid: 1,
//       roleid: 2,
//       first_name: 'Viktoria',
//       last_name: 'Verde',
//       username: 'viktoria_verde',
//       password: 'hashed_password',
//       status: 1,
//       extra_info: JSON.stringify({
//         bio: 'Linguist, polyglot, and language teacher with 15+ years of experience.',
//         verified: true,
//       }),
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       userid: 2,
//       roleid: 2,
//       first_name: 'James',
//       last_name: 'Wilkins',
//       username: 'james_wilkins',
//       password: 'hashed_password',
//       status: 1,
//       extra_info: JSON.stringify({
//         bio: 'Data Scientist and AI enthusiast',
//         followers: 1500,
//         verified: false,
//       }),
//       created_at: new Date('2024-01-15'),
//       updated_at: new Date('2024-01-15'),
//     },
//     {
//       userid: 3,
//       roleid: 2,
//       first_name: 'Sam',
//       last_name: 'Smith',
//       username: 'smoul',
//       password: 'hashed_password',
//       status: 1,
//       extra_info: JSON.stringify({
//         bio: 'Entrepreneur and business strategist',
//         followers: 3200,
//         verified: true,
//       }),
//       created_at: new Date('2024-01-10'),
//       updated_at: new Date('2024-01-10'),
//     },
//     {
//       userid: 4,
//       roleid: 2,
//       first_name: 'Maria',
//       last_name: 'Rodriguez',
//       username: 'maria_rodriguez',
//       password: 'hashed_password',
//       status: 1,
//       extra_info: JSON.stringify({
//         bio: 'Language learner and travel enthusiast',
//         followers: 450,
//         verified: false,
//       }),
//       created_at: new Date('2024-02-01'),
//       updated_at: new Date('2024-02-01'),
//     },
//     {
//       userid: 5,
//       roleid: 2,
//       first_name: 'James',
//       last_name: 'Chen',
//       username: 'james_chen',
//       password: 'hashed_password',
//       status: 1,
//       extra_info: JSON.stringify({
//         bio: 'Software engineer and polyglot',
//         followers: 890,
//         verified: false,
//       }),
//       created_at: new Date('2024-02-05'),
//       updated_at: new Date('2024-02-05'),
//     },
//   ];

//   private categories: Category[] = [
//     {
//       categoryid: 1,
//       category_name: 'Language Learning',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 2,
//       category_name: 'Education',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 3,
//       category_name: 'Science',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 4,
//       category_name: 'AI',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 5,
//       category_name: 'Productivity',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 6,
//       category_name: 'Business',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//     {
//       categoryid: 7,
//       category_name: 'Entrepreneurship',
//       status: 1,
//       created_at: new Date('2024-01-01'),
//       updated_at: new Date('2024-01-01'),
//     },
//   ];

//   private posts: Post[] = [
//     {
//       postid: 1,
//       userid: 1,
//       languageid: 1,
//       title: 'How to Learn a Language: The Complete System That Actually Works',
//       status: 2, // approved
//       content: JSON.stringify({
//         time: 1672531200000,
//         blocks: [
//           {
//             id: 'block1',
//             type: 'paragraph',
//             data: {
//               text: "Learning a new language can feel overwhelming. With so many methods, apps, and approaches available, it's easy to get lost in the noise. But what if I told you there's a systematic approach backed by science that actually works?",
//             },
//           },
//           {
//             id: 'block2',
//             type: 'paragraph',
//             data: {
//               text: "As a linguist who speaks seven languages fluently and has taught thousands of students, I've distilled the most effective language learning strategies into a comprehensive system. This isn't about quick fixes or magic bullets — it's about understanding how your brain actually acquires language and working with it, not against it.",
//             },
//           },
//           {
//             id: 'block3',
//             type: 'header',
//             data: {
//               text: 'The Foundation: Understanding How We Learn Languages',
//               level: 2,
//             },
//           },
//           {
//             id: 'block4',
//             type: 'paragraph',
//             data: {
//               text: "Before diving into specific techniques, it's crucial to understand that language acquisition is fundamentally different from other types of learning. Your brain has specialized mechanisms for processing language that evolved over millions of years.",
//             },
//           },
//           {
//             id: 'block5',
//             type: 'paragraph',
//             data: {
//               text: 'Research in neurolinguistics shows that successful language learners activate the same brain regions that native speakers use. This happens through a process called "implicit learning" — your brain naturally picks up patterns without conscious effort.',
//             },
//           },
//           {
//             id: 'block6',
//             type: 'header',
//             data: {
//               text: 'The 20 Science-Based Principles',
//               level: 2,
//             },
//           },
//           {
//             id: 'block7',
//             type: 'header',
//             data: {
//               text: '1. Comprehensible Input is King',
//               level: 3,
//             },
//           },
//           {
//             id: 'block8',
//             type: 'paragraph',
//             data: {
//               text: "Stephen Krashen's Input Hypothesis remains one of the most validated theories in language acquisition. You need to consume content that's slightly above your current level — challenging enough to learn from, but not so difficult that you're lost.",
//             },
//           },
//           {
//             id: 'block9',
//             type: 'image',
//             data: {
//               file: {
//                 url: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg?auto=compress&cs=tinysrgb&w=800',
//               },
//               caption:
//                 'Language learning requires consistent practice and exposure to comprehensible input',
//               withBorder: false,
//               withBackground: false,
//               stretched: false,
//             },
//           },
//           {
//             id: 'block10',
//             type: 'paragraph',
//             data: {
//               text: 'The most successful language learners understand that fluency comes not from memorizing grammar rules, but from developing an intuitive feel for the language through extensive exposure and practice.',
//             },
//           },
//         ],
//         version: '2.28.2',
//       }),
//       created_at: new Date('2024-05-21'),
//       updated_at: new Date('2024-05-21'),
//     },
//     {
//       postid: 2,
//       userid: 2,
//       languageid: 1,
//       title: "You're using ChatGPT wrong. Here's how to prompt like a pro",
//       status: 2, // approved
//       content: JSON.stringify({
//         time: 1672617600000,
//         blocks: [
//           {
//             id: 'block1',
//             type: 'paragraph',
//             data: {
//               text: "Artificial Intelligence has revolutionized how we work, learn, and create. But most people are barely scratching the surface of what's possible with tools like ChatGPT. The difference between a mediocre result and a game-changing one often comes down to how you craft your prompts.",
//             },
//           },
//           {
//             id: 'block2',
//             type: 'paragraph',
//             data: {
//               text: "After spending months experimenting with different prompting techniques and analyzing thousands of interactions, I've discovered patterns that consistently produce better results. Here's your complete guide to prompting like a professional.",
//             },
//           },
//           {
//             id: 'block3',
//             type: 'header',
//             data: {
//               text: 'Understanding the Fundamentals',
//               level: 2,
//             },
//           },
//           {
//             id: 'block4',
//             type: 'paragraph',
//             data: {
//               text: "ChatGPT isn't just a search engine or a simple question-answering tool. It's a sophisticated language model that responds to context, nuance, and specific instructions. The key is learning how to communicate with it effectively.",
//             },
//           },
//           {
//             id: 'block5',
//             type: 'header',
//             data: {
//               text: 'The Anatomy of a Perfect Prompt',
//               level: 3,
//             },
//           },
//           {
//             id: 'block6',
//             type: 'paragraph',
//             data: {
//               text: 'A well-crafted prompt has several components:',
//             },
//           },
//           {
//             id: 'block7',
//             type: 'list',
//             data: {
//               style: 'ordered',
//               items: [
//                 '<strong>Context</strong>: Set the stage',
//                 '<strong>Role</strong>: Define who the AI should be',
//                 '<strong>Task</strong>: Clearly state what you want',
//                 '<strong>Format</strong>: Specify how you want the output',
//                 '<strong>Constraints</strong>: Set boundaries and limitations',
//               ],
//             },
//           },
//           {
//             id: 'block8',
//             type: 'header',
//             data: {
//               text: 'Advanced Techniques That Actually Work',
//               level: 2,
//             },
//           },
//           {
//             id: 'block9',
//             type: 'image',
//             data: {
//               file: {
//                 url: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
//               },
//               caption:
//                 'AI and machine learning are transforming how we interact with technology',
//               withBorder: false,
//               withBackground: false,
//               stretched: false,
//             },
//           },
//           {
//             id: 'block10',
//             type: 'paragraph',
//             data: {
//               text: "The key to effective prompting lies in understanding that you're not just asking questions—you're having a conversation with an AI that can take on different roles and perspectives.",
//             },
//           },
//         ],
//         version: '2.28.2',
//       }),
//       created_at: new Date('2024-06-05'),
//       updated_at: new Date('2024-06-05'),
//     },
//     {
//       postid: 3,
//       userid: 3,
//       languageid: 1,
//       title: 'Build A Brand, Not A Business',
//       status: 2, // approved
//       content: JSON.stringify({
//         time: 1672790400000,
//         blocks: [
//           {
//             id: 'block1',
//             type: 'paragraph',
//             data: {
//               text: "In today's hyper-connected world, the companies that thrive aren't just selling products—they're selling stories, values, and experiences. They've moved beyond the traditional business model to something more powerful: they've built brands that people believe in.",
//             },
//           },
//           {
//             id: 'block2',
//             type: 'paragraph',
//             data: {
//               text: "The difference between a business and a brand isn't just semantic. It's the difference between surviving and thriving, between competing on price and commanding premium, between having customers and having advocates.",
//             },
//           },
//           {
//             id: 'block3',
//             type: 'header',
//             data: {
//               text: 'Why Brands Win in the Long Run',
//               level: 2,
//             },
//           },
//           {
//             id: 'block4',
//             type: 'paragraph',
//             data: {
//               text: 'A business sells products. A brand sells meaning.',
//             },
//           },
//           {
//             id: 'block5',
//             type: 'paragraph',
//             data: {
//               text: "When you build a business, you're focused on transactions. When you build a brand, you're focused on relationships. And in an economy where consumers have infinite choices, relationships are what create sustainable competitive advantage.",
//             },
//           },
//           {
//             id: 'block6',
//             type: 'paragraph',
//             data: {
//               text: "Consider Apple. They don't just sell computers and phones—they sell the idea of thinking different. Tesla doesn't just sell cars—they sell the future of transportation. Nike doesn't just sell shoes—they sell the spirit of athletic achievement.",
//             },
//           },
//           {
//             id: 'block7',
//             type: 'image',
//             data: {
//               file: {
//                 url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
//               },
//               caption:
//                 'Building a brand requires thinking beyond products to create meaningful connections',
//               withBorder: false,
//               withBackground: false,
//               stretched: false,
//             },
//           },
//           {
//             id: 'block8',
//             type: 'header',
//             data: {
//               text: 'The Brand-First Mindset',
//               level: 2,
//             },
//           },
//           {
//             id: 'block9',
//             type: 'list',
//             data: {
//               style: 'ordered',
//               items: [
//                 '<strong>Start with Why, Not What</strong>: Define your purpose before your products',
//                 '<strong>Values Drive Decisions</strong>: Every choice should align with your brand values',
//                 '<strong>Story Over Statistics</strong>: People buy stories, not features',
//               ],
//             },
//           },
//         ],
//         version: '2.28.2',
//       }),
//       created_at: new Date('2024-02-10'),
//       updated_at: new Date('2024-02-10'),
//     },
//     {
//       postid: 4,
//       userid: 4,
//       languageid: 2,
//       title: 'Làm Thế Nào Để Du Lịch và Học Ngôn Ngữ Cùng Lúc',
//       status: 2, // approved
//       content: `Du lịch và học ngôn ngữ là hai đam mê có thể kết hợp một cách hoàn hảo. Khi bạn khám phá những vùng đất mới, việc học ngôn ngữ bản địa không chỉ giúp bạn giao tiếp mà còn làm sâu sắc thêm trải nghiệm văn hóa.

// Tôi đã du lịch qua 15 quốc gia và học được 4 ngôn ngữ thông qua các chuyến đi. Dưới đây là cách tôi kết hợp cả hai để vừa tận hưởng hành trình vừa nâng cao kỹ năng ngôn ngữ.

// ## Tại Sao Nên Kết Hợp Du Lịch và Học Ngôn Ngữ?

// Học ngôn ngữ trong bối cảnh thực tế giúp bạn hiểu sâu hơn về văn hóa và cách sử dụng ngôn ngữ trong đời sống hàng ngày. Thay vì học từ vựng qua flashcards, bạn học qua các cuộc trò chuyện thực tế, từ việc gọi món ăn đến hỏi đường.

// ### Lợi Ích Chính
// - **Ngữ cảnh thực tế**: Ngôn ngữ trở nên sống động khi bạn sử dụng nó trong các tình huống thực tế.
// - **Kết nối văn hóa**: Hiểu ngôn ngữ giúp bạn hiểu văn hóa, con người, và phong tục.
// - **Động lực mạnh mẽ**: Niềm vui từ việc giao tiếp thành công thúc đẩy bạn học nhanh hơn.

// ## Các Bước Thực Hành

// ### 1. Chuẩn Bị Trước Chuyến Đi
// Học những cụm từ cơ bản như chào hỏi, cảm ơn, và cách hỏi đường. Các ứng dụng như Duolingo hoặc Memrise rất hữu ích để bắt đầu.

// ### 2. Tham Gia Vào Văn Hóa Địa Phương
// - Ở với người bản địa qua Airbnb hoặc homestay.
// - Tham gia các lớp học nấu ăn, tour hướng dẫn, hoặc sự kiện cộng đồng.
// - Tìm các nhóm giao lưu ngôn ngữ tại địa phương.

// ### 3. Thực Hành Mỗi Ngày
// Đừng ngại mắc lỗi. Hãy thử nói chuyện với người bán hàng, tài xế, hoặc nhân viên quán cà phê. Những cuộc trò chuyện ngắn sẽ giúp bạn cải thiện nhanh chóng.

// ## Mẹo Thêm
// - Mang theo một cuốn sổ tay để ghi chú từ vựng mới.
// - Nghe podcast hoặc nhạc trong ngôn ngữ bạn đang học khi di chuyển.
// - Kết bạn với người địa phương để thực hành lâu dài.

// Du lịch không chỉ là khám phá thế giới bên ngoài, mà còn là khám phá chính mình qua ngôn ngữ. Hãy bắt đầu hành trình của bạn ngay hôm nay!`,
//       created_at: new Date('2024-03-15'),
//       updated_at: new Date('2024-03-15'),
//     },
//     {
//       postid: 5,
//       userid: 5,
//       languageid: 3,
//       title: 'Comment coder en apprenant une langue étrangère',
//       status: 2, // approved
//       content: `En tant qu’ingénieur logiciel et polyglotte, j’ai découvert que coder et apprendre une langue étrangère partagent de nombreuses similitudes. Les deux exigent de la logique, de la pratique régulière et une compréhension des structures sous-jacentes.

// Voici comment j’ai combiné mes compétences en programmation avec l’apprentissage des langues pour maximiser l’efficacité des deux.

// ## Les parallèles entre coder et apprendre une langue

// - **Syntaxe et grammaire** : Tout comme le code suit une syntaxe stricte, les langues ont des règles grammaticales. Comprendre ces règles est essentiel.
// - **Pratique régulière** : Écrire du code ou parler une langue tous les jours améliore la fluidité.
// - **Résolution de problèmes** : Déboguer un programme est similaire à trouver le bon mot ou la bonne phrase dans une conversation.

// ## Comment combiner les deux

// ### 1. Utilisez le code pour apprendre
// Créez de petits projets de programmation dans la langue que vous apprenez. Par exemple :
// - Une application simple qui affiche des flashcards de vocabulaire.
// - Un script qui traduit automatiquement des phrases en utilisant une API comme DeepL.

// ### 2. Apprenez en codant
// Lisez la documentation technique ou regardez des tutoriels de programmation dans votre langue cible. Cela vous expose à un vocabulaire technique tout en améliorant vos compétences en codage.

// ### 3. Participez à des communautés
// Rejoignez des forums comme Stack Overflow ou Reddit dans la langue que vous apprenez. Posez des questions ou répondez à celles des autres pour pratiquer.

// ## Exemple concret
// J’ai créé une application web simple en français pour pratiquer mon vocabulaire. Chaque jour, l’application me montrait 10 nouveaux mots et me demandait de les utiliser dans des phrases. Cela m’a aidé à retenir le vocabulaire tout en codant une interface utilisateur.

// ## Conseils pratiques
// - Commencez par des projets simples pour éviter de vous submerger.
// - Utilisez des outils comme GitHub pour partager vos projets et obtenir des retours dans la langue cible.
// - Soyez patient : la maîtrise d’une langue, comme celle d’un langage de programmation, prend du temps.

// Coder et apprendre une langue sont deux compétences qui se renforcent mutuellement. Essayez cette approche et voyez à quelle vitesse vous progressez !`,
//       created_at: new Date('2024-04-20'),
//       updated_at: new Date('2024-04-20'),
//     },
//   ];

//   private categoryPosts: CategoryPost[] = [
//     { postid: 1, categoryid: 1 }, // Language Learning
//     { postid: 1, categoryid: 2 }, // Education
//     { postid: 1, categoryid: 3 }, // Science
//     { postid: 2, categoryid: 4 }, // AI
//     { postid: 2, categoryid: 5 }, // Productivity
//     { postid: 3, categoryid: 6 }, // Business
//     { postid: 3, categoryid: 7 }, // Entrepreneurship
//     { postid: 4, categoryid: 1 }, // Language Learning
//     { postid: 4, categoryid: 2 }, // Education
//     { postid: 5, categoryid: 1 }, // Language Learning
//     { postid: 5, categoryid: 2 }, // Education
//   ];

//   private comments: Comment[] = [
//     {
//       commentid: 1,
//       postid: 1,
//       author: 'Maria Rodriguez',
//       content:
//         "This is exactly what I needed! I've been struggling with Spanish for months using traditional methods. The comprehensible input approach makes so much sense. Thank you for sharing your expertise!",
//       left: 1,
//       right: 2,
//       created_at: new Date('2024-05-23'),
//       updated_at: new Date('2024-05-23'),
//     },
//     {
//       commentid: 2,
//       postid: 1,
//       author: 'James Chen',
//       content:
//         'As someone who learned Mandarin using similar principles, I can confirm this works! The silent period was crucial for me. I spent 3 months just listening to podcasts and watching shows before I even attempted to speak.',
//       left: 3,
//       right: 4,
//       created_at: new Date('2024-05-24'),
//       updated_at: new Date('2024-05-24'),
//     },
//     {
//       commentid: 3,
//       postid: 2,
//       author: 'Sarah Johnson',
//       content:
//         "Great tips! I've been using ChatGPT for months but never thought about the role-playing method. Just tried it and the results are so much better.",
//       left: 1,
//       right: 2,
//       created_at: new Date('2024-06-06'),
//       updated_at: new Date('2024-06-06'),
//     },
//   ];

//   // Service Methods
//   getRoles(): Observable<Role[]> {
//     return of(this.roles);
//   }

//   getLanguages(): Observable<Language[]> {
//     return of(this.languages);
//   }

//   getUsers(): Observable<User[]> {
//     return of(this.users);
//   }

//   getUser(userid: number): Observable<User | undefined> {
//     return of(this.users.find((u) => u.userid === userid));
//   }

//   getCategories(): Observable<Category[]> {
//     return of(this.categories);
//   }

//   getPosts(): Observable<Post[]> {
//     return of(this.posts.filter((p) => p.status === 2)); // Only approved posts
//   }

//   getPost(postid: number): Observable<Post | undefined> {
//     return of(this.posts.find((p) => p.postid === postid));
//   }

//   getPostsWithDetails(): Observable<PostWithDetails[]> {
//     const postsWithDetails: PostWithDetails[] = this.posts
//       .filter((p) => p.status === 2)
//       .map((post) => {
//         const author = this.users.find((u) => u.userid === post.userid)!;
//         const language = this.languages.find(
//           (l) => l.languageid === post.languageid
//         )!;
//         const postCategories = this.categoryPosts
//           .filter((cp) => cp.postid === post.postid)
//           .map(
//             (cp) => this.categories.find((c) => c.categoryid === cp.categoryid)!
//           );
//         const postComments = this.comments.filter(
//           (c) => c.postid === post.postid
//         );

//         // Calculate read time (rough estimate: 200 words per minute)
//         const wordCount = post.content.split(' ').length;
//         const readTime = Math.ceil(wordCount / 200);

//         // Mock claps based on post age and content length
//         const daysSinceCreated = Math.floor(
//           (Date.now() - post.created_at.getTime()) / (1000 * 60 * 60 * 24)
//         );
//         const claps =
//           Math.floor(Math.random() * 2000) + (100 - daysSinceCreated * 10);

//         // Mock image URLs
//         const imageUrls = [
//           'https://images.pexels.com/photos/8197562/pexels-photo-8197562.jpeg?auto=compress&cs=tinysrgb&w=400',
//           'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
//           'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
//           'https://images.pexels.com/photos/462118/pexels-photo-462118.jpeg?auto=compress&cs=tinysrgb&w=400',
//           'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=400',
//         ];

//         return {
//           ...post,
//           author,
//           language,
//           categories: postCategories,
//           comments: postComments,
//           claps: Math.max(claps, 100),
//           readTime,
//           imageUrl: imageUrls[post.postid - 1],
//         };
//       });

//     return of(postsWithDetails);
//   }

//   getPostWithDetails(postid: number): Observable<PostWithDetails | undefined> {
//     return new Observable((observer) => {
//       this.getPostsWithDetails().subscribe((posts) => {
//         observer.next(posts.find((p) => p.postid === postid));
//         observer.complete();
//       });
//     });
//   }

//   getComments(postid: number): Observable<Comment[]> {
//     return of(this.comments.filter((c) => c.postid === postid));
//   }

//   getCommentsWithNesting(postid: number): Observable<CommentWithNesting[]> {
//     const postComments = this.comments.filter((c) => c.postid === postid);
//     const nestedComments = this.buildNestedComments(postComments);
//     return of(nestedComments);
//   }

//   private buildNestedComments(comments: Comment[]): CommentWithNesting[] {
//     // Sort by left value for nested set model
//     const sortedComments = comments.sort((a, b) => a.left - b.left);
//     const result: CommentWithNesting[] = [];
//     const stack: CommentWithNesting[] = [];

//     for (const comment of sortedComments) {
//       const nestedComment: CommentWithNesting = {
//         ...comment,
//         level: 0,
//         children: [],
//       };

//       // Calculate nesting level
//       while (stack.length > 0 && stack[stack.length - 1].right < comment.left) {
//         stack.pop();
//       }

//       nestedComment.level = stack.length;

//       if (stack.length === 0) {
//         result.push(nestedComment);
//       } else {
//         stack[stack.length - 1].children.push(nestedComment);
//       }

//       stack.push(nestedComment);
//     }

//     return result;
//   }

//   createPost(
//     post: Omit<Post, 'postid' | 'created_at' | 'updated_at'>
//   ): Observable<Post> {
//     const newPost: Post = {
//       ...post,
//       postid: Math.max(...this.posts.map((p) => p.postid)) + 1,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };
//     this.posts.push(newPost);
//     return of(newPost);
//   }

//   updatePost(postid: number, updates: Partial<Post>): Observable<Post | null> {
//     const postIndex = this.posts.findIndex((p) => p.postid === postid);
//     if (postIndex === -1) return of(null);

//     this.posts[postIndex] = {
//       ...this.posts[postIndex],
//       ...updates,
//       updated_at: new Date(),
//     };
//     return of(this.posts[postIndex]);
//   }

//   deletePost(postid: number): Observable<boolean> {
//     const postIndex = this.posts.findIndex((p) => p.postid === postid);
//     if (postIndex === -1) return of(false);

//     this.posts[postIndex].deleted_at = new Date();
//     return of(true);
//   }

//   addComment(
//     comment: Omit<
//       Comment,
//       'commentid' | 'created_at' | 'updated_at' | 'left' | 'right'
//     >
//   ): Observable<Comment> {
//     // Calculate left and right values for nested set model
//     const postComments = this.comments.filter(
//       (c) => c.postid === comment.postid
//     );
//     const maxRight = Math.max(...postComments.map((c) => c.right), 0);

//     const newComment: Comment = {
//       ...comment,
//       commentid: Math.max(...this.comments.map((c) => c.commentid)) + 1,
//       left: maxRight + 1,
//       right: maxRight + 2,
//       created_at: new Date(),
//       updated_at: new Date(),
//     };

//     this.comments.push(newComment);
//     return of(newComment);
//   }

//   clapPost(_postid: number): Observable<boolean> {
//     // In a real app, this would update a claps table
//     // For now, we'll just return success
//     return of(true);
//   }
// }
