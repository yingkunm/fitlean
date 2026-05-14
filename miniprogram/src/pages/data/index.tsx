import Taro from '@tarojs/taro';
import { Button, Text, Textarea, View } from '@tarojs/components';
import { useState } from 'react';
import { clearData, createSampleData, exportData, importData, loadData, saveData } from '../../lib/storage';

export default function DataPage() {
  const [text, setText] = useState('');

  const loadSample = () => {
    Taro.showModal({
      title: '加载示例数据',
      content: '会覆盖当前小程序本地数据，确定继续吗？',
      success(result) {
        if (result.confirm) {
          saveData(createSampleData());
          Taro.showToast({ title: '已加载', icon: 'success' });
        }
      },
    });
  };

  const copyExport = () => {
    Taro.setClipboardData({
      data: exportData(loadData()),
      success: () => Taro.showToast({ title: '已复制', icon: 'success' }),
    });
  };

  const doImport = () => {
    try {
      saveData(importData(text));
      setText('');
      Taro.showToast({ title: '导入成功', icon: 'success' });
    } catch {
      Taro.showToast({ title: 'JSON 不正确', icon: 'none' });
    }
  };

  const doClear = () => {
    Taro.showModal({
      title: '清空数据',
      content: '确定清空所有本地数据吗？',
      success(result) {
        if (result.confirm) {
          clearData();
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      },
    });
  };

  return (
    <View className="page">
      <View className="hero">
        <Text className="eyebrow">Data</Text>
        <Text className="title">数据管理</Text>
        <Text className="muted">所有数据保存在微信小程序本地存储中。</Text>
      </View>
      <View className="panel">
        <Text className="section-title">导入 JSON</Text>
        <Textarea className="textarea" value={text} placeholder="粘贴导出的 JSON 内容" onInput={(e) => setText(e.detail.value)} />
        <View className="button-row">
          <Button className="btn btn-primary" onClick={doImport}>确认导入</Button>
        </View>
      </View>
      <View className="button-row">
        <Button className="btn" onClick={loadSample}>加载示例</Button>
        <Button className="btn" onClick={copyExport}>复制导出</Button>
      </View>
      <View className="button-row">
        <Button className="btn btn-danger" onClick={doClear}>清空数据</Button>
      </View>
    </View>
  );
}
