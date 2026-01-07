<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>我的设计作品集</title>
    <style>
        /* --- 1. 核心配色与重置 --- */
        :root {
            --bg-color: #f8f9fa;
            --card-bg: #ffffff;
            --primary: #222222;
            --active: #000000;
            --text-gray: #666666;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; outline: none; -webkit-tap-highlight-color: transparent; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: var(--bg-color); color: var(--primary); padding-bottom: 60px; }

        /* --- 2. 极简头部 --- */
        header {
            position: sticky; top: 0; z-index: 100;
            background: rgba(255, 255, 255, 0.92);
            backdrop-filter: blur(10px);
            padding: 18px 20px;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            display: flex; justify-content: space-between; align-items: center;
        }
        h1 { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.5px; text-transform: uppercase; }
        .contact-link { font-size: 0.85rem; font-weight: 500; text-decoration: none; color: var(--text-gray); }

        /* --- 3. 筛选标签 --- */
        .tabs-container {
            position: sticky; top: 56px; z-index: 90;
            background: var(--bg-color);
            padding: 15px 20px;
            overflow-x: auto; white-space: nowrap;
            -ms-overflow-style: none; scrollbar-width: none;
        }
        .tabs-container::-webkit-scrollbar { display: none; }
        
        .tab-btn {
            display: inline-block;
            padding: 8px 18px;
            margin-right: 10px;
            border-radius: 20px;
            border: 1px solid rgba(0,0,0,0.05);
            background: #ffffff;
            color: var(--text-gray);
            font-size: 0.85rem; font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .tab-btn.active {
            background: var(--active);
            color: #ffffff;
            border-color: var(--active);
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        /* --- 4. 瀑布流网格 --- */
        .gallery {
            display: grid;
            grid-template-columns: 1fr; /* 手机单列 */
            gap: 24px;
            padding: 5px 20px 20px 20px;
            max-width: 800px; margin: 0 auto;
        }
        
        /* 平板和桌面端双列 */
        @media (min-width: 600px) {
            .gallery { grid-template-columns: repeat(2, 1fr); }
        }

        .card {
            background: var(--card-bg);
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.03);
            transition: transform 0.2s ease;
            cursor: pointer;
        }
        .card:active { transform: scale(0.98); }
        
        .card img {
            width: 100%; height: auto;
            display: block;
            object-fit: cover;
        }

        .card-info { padding: 14px 16px; }
        .card-title { font-size: 0.95rem; font-weight: 700; margin-bottom: 6px; color: #111; }
        .card-meta { font-size: 0.75rem; color: #999; display: flex; align-items: center; gap: 6px; }
        .dot { width: 6px; height: 6px; background: #ddd; border-radius: 50%; }

        /* --- 5. Lightbox (看大图) --- */
        .lightbox {
            display: none; position: fixed; z-index: 1000;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.95);
            justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.2s;
        }
        .lightbox.active { display: flex; opacity: 1; }
        .lightbox img {
            max-width: 100%; max-height: 100%;
            object-fit: contain;
            transform: scale(0.95); transition: transform 0.2s;
        }
        .lightbox.active img { transform: scale(1); }
        .close-lb {
            position: absolute; top: 20px; right: 20px;
            width: 40px; height: 40px;
            background: rgba(255,255,255,0.15);
            border-radius: 50%;
            display: flex; justify-content: center; align-items: center;
            color: white; font-size: 24px; cursor: pointer;
        }
        
        /* 加载状态 */
        .loading { text-align: center; color: #999; padding: 40px; font-size: 0.9rem; }
    </style>
</head>
<body>

    <header>
        <h1>My Portfolio.</h1>
        <a href="#" class="contact-link">Contact</a>
    </header>

    <div class="tabs-container">
        <button class="tab-btn active" onclick="filterData('全部', this)">全部</button>
        <button class="tab-btn" onclick="filterData('海报', this)">海报</button>
        <button class="tab-btn" onclick="filterData('详情页', this)">详情页</button>
        <button class="tab-btn" onclick="filterData('线下物料', this)">线下物料</button>
    </div>

    <div class="gallery" id="gallery">
        <div class="loading">作品加载中...</div>
    </div>

    <div id="lightbox" class="lightbox" onclick="closeLightbox()">
        <div class="close-lb">&times;</div>
        <img id="lb-img" src="">
    </div>

    <script src="data.js"></script>

    <script>
        // DOM 元素
        const gallery = document.getElementById('gallery');
        const lightbox = document.getElementById('lightbox');
        const lbImg = document.getElementById('lb-img');
        let currentFilter = '全部';

        // 1. 检查数据是否加载成功
        window.onload = function() {
            if (typeof myPortfolioData !== 'undefined') {
                renderGallery();
            } else {
                gallery.innerHTML = '<div class="loading">错误：无法加载 data.js 文件</div>';
            }
        };

        // 2. 渲染核心逻辑
        function renderGallery() {
            gallery.innerHTML = ''; // 清空当前内容

            // 筛选数据
            const items = currentFilter === '全部' 
                ? myPortfolioData 
                : myPortfolioData.filter(item => item.category === currentFilter);

            // 空状态处理
            if (items.length === 0) {
                gallery.innerHTML = '<div class="loading">该分类下暂无作品</div>';
                return;
            }

            // 生成卡片
            items.forEach(item => {
                const card = document.createElement('div');
                card.className = 'card';
                card.onclick = () => openLightbox(item.img); // 点击打开大图
                
                card.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" loading="lazy">
                    <div class="card-info">
                        <div class="card-title">${item.title}</div>
                        <div class="card-meta">
                            <span class="dot"></span>
                            <span>${item.category}</span>
                        </div>
                    </div>
                `;
                gallery.appendChild(card);
            });
        }

        // 3. 筛选点击事件
        function filterData(category, btn) {
            currentFilter = category;
            
            // 按钮样式切换
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.