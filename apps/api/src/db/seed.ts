import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { categories, posts, postTags, profiles, tags, users } from "./schema";

const DATABASE_URL = process.env.DATABASE_URL ?? "";

const client = postgres(DATABASE_URL, {
	prepare: false,
	max: 1,
	ssl: "require",
	connection: { statement_timeout: 30_000 },
});
const db = drizzle(client);

const CATEGORIES = [
	{
		name: "Travel",
		slug: "travel",
		icon: "✈️",
		description:
			"Adventures, destinations, and travel tips from around the world",
	},
	{
		name: "Work",
		slug: "work",
		icon: "💼",
		description: "Productivity, career growth, and workplace insights",
	},
	{
		name: "Software",
		slug: "software",
		icon: "💻",
		description: "Engineering, architecture, and software development",
	},
	{
		name: "Design",
		slug: "design",
		icon: "🎨",
		description: "UI/UX, visual design, and creative process",
	},
	{
		name: "Health",
		slug: "health",
		icon: "❤️",
		description: "Wellness, fitness, and mental health",
	},
	{
		name: "Food",
		slug: "food",
		icon: "🍴",
		description: "Recipes, restaurants, and culinary adventures",
	},
	{
		name: "Finance",
		slug: "finance",
		icon: "💰",
		description: "Personal finance, investing, and money management",
	},
	{
		name: "Education",
		slug: "education",
		icon: "📚",
		description: "Learning, courses, and knowledge sharing",
	},
	{
		name: "Other",
		slug: "other",
		icon: "📦",
		description: "Everything else worth writing about",
	},
];

const TAGS = [
	// Travel
	{ name: "Backpacking", slug: "backpacking" },
	{ name: "Solo travel", slug: "solo-travel" },
	{ name: "Road trip", slug: "road-trip" },
	{ name: "Budget travel", slug: "budget-travel" },
	{ name: "Asia", slug: "asia" },
	{ name: "Europe", slug: "europe" },
	// Work
	{ name: "Remote work", slug: "remote-work" },
	{ name: "Productivity", slug: "productivity" },
	{ name: "Career", slug: "career" },
	{ name: "Leadership", slug: "leadership" },
	{ name: "Freelancing", slug: "freelancing" },
	// Software
	{ name: "TypeScript", slug: "typescript" },
	{ name: "Vue.js", slug: "vuejs" },
	{ name: "React", slug: "react" },
	{ name: "Bun", slug: "bun" },
	{ name: "PostgreSQL", slug: "postgresql" },
	{ name: "Open source", slug: "open-source" },
	{ name: "DevOps", slug: "devops" },
	{ name: "AI", slug: "ai" },
	// Design
	{ name: "UI design", slug: "ui-design" },
	{ name: "UX research", slug: "ux-research" },
	{ name: "Figma", slug: "figma" },
	// Health
	{ name: "Running", slug: "running" },
	{ name: "Meditation", slug: "meditation" },
	{ name: "Nutrition", slug: "nutrition" },
	// Food
	{ name: "Vietnamese cuisine", slug: "vietnamese-cuisine" },
	{ name: "Vegetarian", slug: "vegetarian" },
	{ name: "Recipes", slug: "recipes" },
	// Finance
	{ name: "Investing", slug: "investing" },
	{ name: "Savings", slug: "savings" },
	// General
	{ name: "Tutorial", slug: "tutorial" },
	{ name: "Opinion", slug: "opinion" },
	{ name: "Review", slug: "review" },
	{ name: "News", slug: "news" },
];

const LANDSCAPE_IMAGES = [
	"https://images.unsplash.com/photo-1506905489134-fe986f790bea?w=1200&q=80",
	"https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
	"https://images.unsplash.com/photo-1448375240-1e63e9c0cf6c?w=1200&q=80",
	"https://images.unsplash.com/photo-1469854523086-cc02736b2a83?w=1200&q=80",
	"https://images.unsplash.com/photo-1531366936-9dc5da8e3f56?w=1200&q=80",
	"https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=1200&q=80",
	"https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
	"https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
	"https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1200&q=80",
	"https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
];

const SEED_POSTS = [
	{
		title: "Chinh phục đỉnh Fansipan: Hành trình đáng nhớ nhất cuộc đời",
		slug: "chinh-phuc-dinh-fansipan",
		excerpt:
			"Fansipan – nóc nhà Đông Dương với độ cao 3.143m – là giấc mơ của bao tâm hồn yêu núi. Bài viết chia sẻ toàn bộ hành trình chinh phục đỉnh núi hùng vĩ này.",
		content: `Fansipan là ngọn núi cao nhất Đông Dương với độ cao 3.143m so với mực nước biển, nằm trong dãy Hoàng Liên Sơn thuộc địa phận tỉnh Lào Cai.

## Chuẩn bị hành lý

Trước khi lên đường, tôi dành cả tuần để chuẩn bị: giày trekking chống trơn, áo mưa, đồ ăn khô, nước uống và thuốc cơ bản. Thời tiết trên đỉnh có thể thay đổi rất nhanh, buổi sáng nắng đẹp nhưng chiều tối sương mù dày đặc.

## Ngày đầu tiên – Từ Sapa đến trại 2

Xuất phát từ cổng làng Cát Cát lúc 6 giờ sáng, chúng tôi đi qua những thảm rừng nguyên sinh xanh mướt. Mỗi bước chân là một khám phá: tiếng suối chảy, tiếng chim hót, hương thảo mộc rừng núi thoang thoảng trong không khí trong lành.

## Đêm trên núi

Nhiệt độ xuống còn 5°C, chúng tôi co ro trong lều nhưng bầu trời đêm lại rực rỡ sao trời. Đây là trải nghiệm hiếm có mà chỉ những người dám leo núi mới được thấy.

## Đỉnh vinh quang

Sáng sớm ngày thứ hai, khi ánh bình minh vừa ló dạng, chúng tôi đặt chân lên đỉnh Fansipan. Cảnh tượng mây trắng trải dài bên dưới như một đại dương bồng bềnh khiến mọi mệt mỏi tan biến tức khắc.`,
		coverImageIndex: 0,
		categorySlug: "travel",
		tagSlugs: ["backpacking", "asia"],
	},
	{
		title: "Hoàng hôn trên bãi biển Mũi Né – Sắc trời không thể quên",
		slug: "hoang-hon-mui-ne",
		excerpt:
			"Mũi Né nổi tiếng với cồn cát đỏ và hoàng hôn đẹp mê hồn. Cùng khám phá vẻ đẹp thiên nhiên kỳ diệu của vùng đất đầy nắng gió này.",
		content: `Mũi Né thuộc thành phố Phan Thiết, tỉnh Bình Thuận – một trong những điểm du lịch biển nổi tiếng nhất Việt Nam.

## Cồn cát đỏ huyền bí

Điểm đến đầu tiên không thể bỏ qua là đồi cát đỏ, nơi những cồn cát uốn lượn như sóng biển dưới ánh mặt trời. Du khách có thể thuê xe địa hình chạy trên cát hoặc đơn giản ngồi nhìn cảnh mặt trời lặn tuyệt đẹp.

## Suối Tiên – thiên đường ẩn mình

Cách đồi cát không xa là Suối Tiên – dòng suối nhỏ chảy qua những tầng đất sét nhiều màu sắc tạo nên bức tranh thiên nhiên độc đáo. Nước suối mát lạnh và trong vắt là điểm dừng chân lý tưởng sau buổi chiều nóng bức.

## Hoàng hôn trên biển

Đây chính là khoảnh khắc tôi chờ đợi nhất. Khi mặt trời từ từ chìm xuống đường chân trời, bầu trời nhuộm đỏ rực, phản chiếu xuống mặt biển lặng gợn – một cảnh tượng đẹp đến nức lòng.`,
		coverImageIndex: 1,
		categorySlug: "travel",
		tagSlugs: ["asia", "solo-travel"],
	},
	{
		title: "Rừng già Cúc Phương – Hành trình về với thiên nhiên hoang sơ",
		slug: "rung-gia-cuc-phuong",
		excerpt:
			"Vườn quốc gia Cúc Phương là khu rừng nguyên sinh lớn nhất miền Bắc Việt Nam, nơi thời gian như dừng lại giữa tán cây nghìn năm tuổi.",
		content: `Vườn quốc gia Cúc Phương nằm giữa 3 tỉnh Ninh Bình, Hòa Bình và Thanh Hóa, được thành lập năm 1962 – khu bảo tồn thiên nhiên đầu tiên của Việt Nam.

## Cây chò ngàn năm

Ngay từ cổng vào, du khách đã được đón tiếp bởi những cây chò khổng lồ vươn thẳng lên trời, thân cây phải 5-6 người ôm mới hết. Đứng dưới tán cây, cảm giác nhỏ bé trước thiên nhiên vĩ đại thật kỳ diệu.

## Hang động thời tiền sử

Trong rừng có nhiều hang động chứa di tích người tiền sử từ hàng nghìn năm trước. Hang Con Moong là một trong những điểm khảo cổ quan trọng nhất Đông Nam Á.

## Trung tâm cứu hộ động vật

Cúc Phương có trung tâm cứu hộ linh trưởng nổi tiếng, nơi nuôi dưỡng các loài vượn, culi đang có nguy cơ tuyệt chủng. Được gặp gỡ những sinh vật quý hiếm này là trải nghiệm không thể nào quên.`,
		coverImageIndex: 2,
		categorySlug: "travel",
		tagSlugs: ["backpacking", "asia"],
	},
	{
		title: "Sa mạc cát Bàu Trắng – Tiểu Sahara giữa lòng Việt Nam",
		slug: "bau-trang-mui-ne",
		excerpt:
			"Bàu Trắng là hồ nước ngọt yên bình nép mình giữa những đồi cát trắng mênh mông, tạo nên khung cảnh tương phản đẹp mắt hiếm có.",
		content: `Cách trung tâm Mũi Né khoảng 25km về phía Bắc, Bàu Trắng ẩn mình giữa những đồi cát trắng tinh, tạo nên cảnh quan vừa hùng vĩ vừa thơ mộng.

## Cồn cát trắng ngát

Khác với đồi cát đỏ ở Mũi Né, Bàu Trắng có màu cát trắng tinh khiết, trải dài vô tận dưới nắng vàng. Những làn gió nhẹ tạo ra các hoa văn uốn lượn trên mặt cát như những tác phẩm nghệ thuật tự nhiên.

## Hồ Bàu Sen và Bàu Ông

Hai hồ nước ngọt nằm giữa sa mạc cát là điểm nhấn độc đáo nhất nơi đây. Bàu Sen có sen nở rộ vào mùa hè, còn Bàu Ông yên tĩnh và trong xanh quanh năm.

## Bình minh sa mạc

Ở lại qua đêm để bắt kịp bình minh sa mạc là điều tôi không hối hận. Khi ánh sáng đầu tiên của ngày mới chiếu xuống, những đồi cát chuyển màu vàng rực rỡ trước khi bầu trời xanh hẳn.`,
		coverImageIndex: 3,
		categorySlug: "travel",
		tagSlugs: ["road-trip", "asia"],
	},
	{
		title: "Bắc cực quang ở Iceland – Khi thiên nhiên vẽ tranh trên bầu trời",
		slug: "bac-cuc-quang-iceland",
		excerpt:
			"Cực quang Bắc – Northern Lights – là hiện tượng thiên nhiên huyền ảo nhất tôi từng được chứng kiến trong suốt hành trình khám phá thế giới.",
		content: `Iceland, hòn đảo lửa và băng nằm giữa Đại Tây Dương, là một trong những nơi tốt nhất trên thế giới để ngắm cực quang Bắc.

## Mùa nào đẹp nhất?

Cực quang chỉ xuất hiện từ tháng 9 đến tháng 3, khi Iceland có đêm đủ tối. Thời điểm lý tưởng nhất là từ tháng 11 đến tháng 2, khi đêm dài nhất và hoạt động mặt trời mạnh nhất.

## Đêm kỳ diệu bên hồ Thingvallavatn

Đêm thứ ba ở Iceland, tôi may mắn chứng kiến màn trình diễn cực quang tuyệt đẹp ngay trên hồ Thingvallavatn. Những dải sáng xanh lục, tím, đỏ uốn lượn như dải lụa khổng lồ trải dài trên bầu trời.

## Thác Skógafoss trong tuyết trắng

Buổi sáng sau đêm cực quang, tôi đến thác Skógafoss trong tuyết trắng tinh. Thác nước rộng 25m đổ ầm ầm, tạo ra những vòng cầu vồng băng giá lung linh trong ánh mặt trời lạnh giá.`,
		coverImageIndex: 4,
		categorySlug: "travel",
		tagSlugs: ["solo-travel", "europe"],
	},
	{
		title: "Thác Bản Giốc – Viên ngọc thô của núi rừng Cao Bằng",
		slug: "thac-ban-gioc-cao-bang",
		excerpt:
			"Thác Bản Giốc là thác nước hùng vĩ nhất Đông Nam Á, một kiệt tác của thiên nhiên nằm ngay trên đường biên giới Việt – Trung.",
		content: `Thác Bản Giốc thuộc xã Đàm Thủy, huyện Trùng Khánh, tỉnh Cao Bằng – cách Hà Nội khoảng 350km về phía Đông Bắc.

## Hành trình lên Cao Bằng

Đường đến Bản Giốc uốn lượn qua những thung lũng đá vôi xanh mướt, ruộng bậc thang vàng óng mùa lúa chín và những bản làng người Tày, Nùng bình yên. Bản thân hành trình đã là một cuộc phiêu lưu tuyệt vời.

## Thác nước hùng vĩ

Nghe tiếng nước đổ ầm ầm từ xa, lòng đã xốn xang. Khi con thác hiện ra trước mắt – trải rộng 300m, đổ từ độ cao 30m – cảm giác choáng ngợp trước sức mạnh thiên nhiên thật khó diễn tả.

## Động Ngườm Ngao huyền bí

Cách thác Bản Giốc 3km là động Ngườm Ngao – một trong những hang động đẹp nhất Việt Nam với những nhũ đá kỳ bí và những dòng suối ngầm trong vắt.`,
		coverImageIndex: 5,
		categorySlug: "travel",
		tagSlugs: ["backpacking", "asia"],
	},
	{
		title: "Cao nguyên đá Đồng Văn – Vùng đất của những cung đường mây",
		slug: "cao-nguyen-da-dong-van",
		excerpt:
			"Cao nguyên đá Đồng Văn – công viên địa chất toàn cầu UNESCO – là nơi những con đường uốn lượn giữa núi đá xám, mây trắng và sắc hoa tam giác mạch.",
		content: `Cao nguyên đá Đồng Văn thuộc tỉnh Hà Giang, được UNESCO công nhận là Công viên địa chất toàn cầu năm 2010 – địa danh đầu tiên tại Đông Nam Á đạt danh hiệu này.

## Cột cờ Lũng Cú – Cực Bắc Tổ quốc

Đứng dưới cột cờ Lũng Cú, lá cờ đỏ sao vàng phất phới trong gió lạnh núi cao, lòng dâng lên niềm tự hào khó tả. Đây là điểm cực Bắc của Việt Nam, nơi đất trời gặp nhau giữa mây và núi.

## Đèo Mã Pì Lèng hùng vĩ

Đèo Mã Pì Lèng dài 20km là một trong tứ đại đỉnh đèo của Việt Nam. Nhìn xuống vực sâu hàng trăm mét là dòng sông Nho Quế xanh ngọc uốn lượn – cảnh tượng đẹp đến rùng rợn.

## Mùa hoa tam giác mạch

Tháng 10-11 hàng năm, những vạt hoa tam giác mạch trắng hồng phủ kín thung lũng và sườn đồi, tạo nên khung cảnh như chốn thần tiên giữa cao nguyên đá lạnh giá.`,
		coverImageIndex: 6,
		categorySlug: "travel",
		tagSlugs: ["road-trip", "asia"],
	},
	{
		title: "Grand Canyon – Kỳ quan của triệu triệu năm",
		slug: "grand-canyon-ky-quan",
		excerpt:
			"Grand Canyon không chỉ là một hẻm núi – đó là cuốn sách địa chất dày 2 tỷ năm mà thiên nhiên viết bằng đất đá, nước và thời gian.",
		content: `Grand Canyon, nằm ở tiểu bang Arizona, Hoa Kỳ, là một trong 7 kỳ quan thiên nhiên thế giới với chiều dài 446km, rộng 29km và sâu tới 1.857m.

## Ngắm bình minh tại South Rim

Đến Grand Canyon, điều đầu tiên phải làm là dậy sớm ngắm bình minh từ South Rim. Khi mặt trời mọc, những tầng đất đá nhiều màu sắc – đỏ, vàng, tím, xám – dần hiện ra trong ánh sáng ấm áp. Cảnh tượng này không có ngôn từ nào diễn đạt đủ.

## Hành trình xuống đáy hẻm núi

Leo bộ xuống đáy Grand Canyon theo đường mòn Bright Angel Trail là thử thách thể lực nhưng hoàn toàn xứng đáng. Đáy hẻm núi là một thế giới hoàn toàn khác – ấm hơn, xanh hơn với dòng sông Colorado cuồn cuộn chảy.

## Sky Walk – Đứng trên không trung

Cầu kính Sky Walk nằm ở phía Tây Grand Canyon cho phép du khách bước ra ngoài lề vực, nhìn thẳng xuống đáy hẻm núi sâu thẳm – trải nghiệm kết hợp giữa kỳ diệu và rùng rợn.`,
		coverImageIndex: 7,
		categorySlug: "travel",
		tagSlugs: ["solo-travel", "budget-travel"],
	},
	{
		title: "Hồ Ba Bể – Mặt gương ngọc giữa đại ngàn Bắc Kạn",
		slug: "ho-ba-be-bac-kan",
		excerpt:
			"Hồ Ba Bể là hồ nước ngọt tự nhiên lớn nhất Việt Nam, ẩn sâu trong vườn quốc gia Ba Bể với hệ sinh thái rừng nguyên sinh phong phú.",
		content: `Hồ Ba Bể nằm trong Vườn quốc gia Ba Bể, tỉnh Bắc Kạn – cách Hà Nội khoảng 240km. Hồ được hình thành từ 200 triệu năm trước và là một trong 20 hồ nước ngọt đặc biệt nhất thế giới.

## Chèo thuyền kayak trên hồ

Sáng sớm, mặt hồ phẳng lặng như gương, phản chiếu những ngọn núi đá vôi xanh thẳm và rừng cây nhiệt đới um tùm. Chèo kayak trong không khí mờ sương là trải nghiệm thiền định tuyệt vời.

## Thác Đầu Đẳng và hang Puông

Không xa hồ là thác Đầu Đẳng hùng vĩ và hang Puông dài 300m, nơi hàng nghìn con dơi cư trú. Vào lúc hoàng hôn, đàn dơi bay ra như một đám mây đen khổng lồ – cảnh tượng ngoạn mục.

## Sống cùng người Tày

Ở lại homestay trong bản người Tày ven hồ, thưởng thức cơm lam, thịt hun khói và rượu ngô, lắng nghe tiếng đàn tính trong đêm yên tĩnh – những trải nghiệm văn hóa này mới là linh hồn của chuyến đi.`,
		coverImageIndex: 8,
		categorySlug: "travel",
		tagSlugs: ["backpacking", "asia"],
	},
	{
		title: "Dãy Alps mùa đông – Bản giao hưởng của tuyết và im lặng",
		slug: "day-alps-mua-dong",
		excerpt:
			"Dãy Alps vào mùa đông là thế giới hoàn toàn khác: trắng tinh khôi, im lặng đến nghe được tiếng gió, và đẹp đến nghẹn thở.",
		content: `Dãy Alps trải dài qua 8 quốc gia châu Âu là dãy núi hùng vĩ nhất lục địa già, với đỉnh Mont Blanc cao 4.808m là nóc nhà châu Âu.

## Grindelwald – Làng núi cổ tích

Ngôi làng Grindelwald của Thụy Sĩ nép mình dưới chân núi Eiger như một cảnh trong truyện cổ tích: những ngôi nhà gỗ mái nghiêng phủ tuyết, khói bếp lãng đãng bay lên trong không khí lạnh giá -15°C.

## Đỉnh Jungfraujoch – Top of Europe

Tàu hỏa leo núi đưa du khách lên ga Jungfraujoch ở độ cao 3.454m – ga xe lửa cao nhất châu Âu. Từ đây nhìn ra là thảo nguyên tuyết trắng vô tận, dòng sông băng Aletsch dài 23km uốn lượn xuống thung lũng.

## Trượt tuyết và sự im lặng tuyệt đối

Buổi tối, sau một ngày trượt tuyết, ngồi bên lò sưởi trong căn cabin ấm áp, nhấm nháp ly cacao nóng, nhìn tuyết rơi lặng lẽ ngoài cửa sổ – đây chính là hạnh phúc giản dị mà tôi tìm kiếm.`,
		coverImageIndex: 9,
		categorySlug: "travel",
		tagSlugs: ["solo-travel", "europe"],
	},
];

async function seed() {
	const now = new Date();

	console.log("Seeding categories...");
	await db
		.insert(categories)
		.values(CATEGORIES.map((c) => ({ ...c, updatedAt: now })))
		.onConflictDoUpdate({
			target: categories.slug,
			set: {
				icon: sql`excluded.icon`,
				description: sql`excluded.description`,
				updatedAt: now,
			},
		});
	console.log(`  ✓ ${CATEGORIES.length} categories`);

	console.log("Seeding tags...");
	await db.insert(tags).values(TAGS).onConflictDoNothing({ target: tags.slug });
	console.log(`  ✓ ${TAGS.length} tags`);

	console.log("Seeding demo user & profile...");
	const passwordHash = await Bun.password.hash("Seed@123456", {
		algorithm: "bcrypt",
	});
	const [seedUser] = await db
		.insert(users)
		.values({ email: "seed@demo.com", passwordHash, updatedAt: now })
		.onConflictDoUpdate({
			target: users.email,
			set: { updatedAt: now },
		})
		.returning({ id: users.id });

	const [seedProfile] = await db
		.insert(profiles)
		.values({
			userId: seedUser.id,
			firstName: "Seed",
			lastName: "Author",
			bio: "Người viết blog yêu thiên nhiên và các cuộc phiêu lưu.",
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: profiles.userId,
			set: { updatedAt: now },
		})
		.returning({ id: profiles.id });
	console.log(`  ✓ user #${seedUser.id}, profile #${seedProfile.id}`);

	console.log("Seeding posts...");
	const allCategories = await db
		.select({ id: categories.id, slug: categories.slug })
		.from(categories);
	const allTags = await db.select({ id: tags.id, slug: tags.slug }).from(tags);

	const categoryBySlug = Object.fromEntries(
		allCategories.map((c) => [c.slug, c.id]),
	);
	const tagBySlug = Object.fromEntries(allTags.map((t) => [t.slug, t.id]));

	for (const post of SEED_POSTS) {
		const categoryId = categoryBySlug[post.categorySlug];
		const coverImage = LANDSCAPE_IMAGES[post.coverImageIndex];

		const [inserted] = await db
			.insert(posts)
			.values({
				authorId: seedProfile.id,
				categoryId,
				title: post.title,
				slug: post.slug,
				content: post.content,
				excerpt: post.excerpt,
				coverImage,
				status: "published",
				publishedAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: posts.slug,
				set: {
					title: sql`excluded.title`,
					content: sql`excluded.content`,
					coverImage: sql`excluded.cover_image`,
					updatedAt: now,
				},
			})
			.returning({ id: posts.id });

		const tagIds = post.tagSlugs.map((s) => tagBySlug[s]).filter(Boolean);
		if (tagIds.length > 0) {
			await db
				.insert(postTags)
				.values(tagIds.map((tagId) => ({ postId: inserted.id, tagId })))
				.onConflictDoNothing();
		}

		console.log(`  ✓ "${post.title}"`);
	}

	console.log("\nDone.");
	await client.end();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});
