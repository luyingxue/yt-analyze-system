# YouTube Shorts 数据分析系统

一个用于分析 YouTube Shorts 视频数据的 Web 应用系统。

## 功能特性

### 1. 视频分析
- **基础查询**
  - 支持多条件筛选（频道ID、日期范围、最小播放量）
  - 支持按播放量、发布日期排序
  - 分页显示视频列表
  - 显示视频首帧图片、标题、频道、发布日期、播放量

- **分组查询**
  - 按频道分组显示视频
  - 频道按视频数量排序
  - 支持展开/折叠查看频道下的视频
  - 分页显示频道列表

### 2. 频道分析
- 频道详情页
- 频道视频统计
- 频道数据趋势

## 技术栈

- **前端**
  - Next.js
  - TypeScript
  - Tailwind CSS
  - shadcn/ui 组件库

- **后端**
  - Next.js API Routes
  - MySQL 数据库

## 有用的SQL语句

### 查询日增信息
SELECT 
    t1.channel_id,
    t1.canonical_base_url,  
    t1.view_count as today_views,
    t2.view_count as yesterday_views,
    (t1.view_count - t2.view_count) as view_increase
FROM 
    channel_crawl t1
    LEFT JOIN channel_crawl t2 
    ON t1.channel_id = t2.channel_id 
    AND t2.crawl_date = DATE_SUB(t1.crawl_date, INTERVAL 1 DAY)
WHERE 
    t1.crawl_date = CURDATE()
    AND t2.view_count IS NOT NULL
ORDER BY 
    view_increase DESC;


### 拉黑印度频道
UPDATE channel_base 
SET 
    is_blacklist = 1,
    blacklist_reason = '印度频道'
WHERE channel_id IN (
    SELECT DISTINCT channel_id 
    FROM channel_crawl 
    WHERE country = '印度'
);

### 删除印度频道
DELETE FROM channel_crawl 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id 
        FROM channel_crawl 
        WHERE country = '印度'
    ) AS tmp
);