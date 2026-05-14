export default defineAppConfig({
  pages: [
    'pages/dashboard/index',
    'pages/profile/index',
    'pages/food/index',
    'pages/exercise/index',
    'pages/progress/index',
    'pages/recommendations/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#f6f8f5',
    navigationBarTitleText: '减脂助手',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f6f8f5',
  },
  tabBar: {
    color: '#6a766d',
    selectedColor: '#267a50',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/dashboard/index', text: '首页' },
      { pagePath: 'pages/profile/index', text: '资料' },
      { pagePath: 'pages/food/index', text: '饮食' },
      { pagePath: 'pages/exercise/index', text: '运动' },
      { pagePath: 'pages/progress/index', text: '进度' },
      { pagePath: 'pages/recommendations/index', text: '推荐' },
    ],
  },
});
