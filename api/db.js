import { createClient } from '@supabase/supabase-js';

// 在浏览器环境中，这些值会从 window._env_ 对象中获取
// 在服务器端环境中，会从 process.env 中获取
const supabaseUrl = typeof window !== 'undefined' 
    ? window._env_?.SUPABASE_URL 
    : process.env.SUPABASE_URL;
const supabaseKey = typeof window !== 'undefined'
    ? window._env_?.SUPABASE_KEY
    : process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase 配置缺失');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 产品状态相关操作
export async function getProductStatus() {
    const { data, error } = await supabase
        .from('product_status')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return {
        selectedProducts: data.filter(p => p.is_selected).map(p => p.product_name),
        highlightedProducts: data.filter(p => p.is_highlighted).map(p => p.product_name)
    };
}

export async function updateProductStatus(productName, { isSelected, isHighlighted }) {
    const { data, error } = await supabase
        .from('product_status')
        .upsert({
            product_name: productName,
            is_selected: isSelected,
            is_highlighted: isHighlighted,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'product_name'
        });
    
    if (error) throw error;
    return data;
}

// 产品得分相关操作
export async function saveProductScores(productsData) {
    const { data, error } = await supabase
        .from('product_scores')
        .upsert(productsData.map(product => ({
            product_name: product.name,
            product_id: product.id,
            explanation_count: product.explanationCount,
            transaction_count: product.transactionCount,
            exposure_click_rate: product.exposureClickRate,
            conversion_rate: product.conversionRate,
            efficiency_score: product.efficiencyScore,
            exposure_score: product.exposureScore,
            conversion_score: product.conversionScore,
            transaction_score: product.transactionScore,
            total_score: product.totalScore,
            weighted_score: product.rankingScore,
            updated_at: new Date().toISOString()
        })), {
            onConflict: 'product_name'
        });
    
    if (error) throw error;
    return data;
}

export async function getProductScores() {
    const { data, error } = await supabase
        .from('product_scores')
        .select('*')
        .order('weighted_score', { ascending: false });
    
    if (error) throw error;
    return data;
}

// 权重预设相关操作
export async function getWeightPresets() {
    const { data, error } = await supabase
        .from('weight_presets')
        .select('*')
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
}

export async function updateWeightPreset(presetName, weights) {
    const { data, error } = await supabase
        .from('weight_presets')
        .upsert({
            preset_name: presetName,
            efficiency_weight: weights.efficiency,
            exposure_weight: weights.exposure,
            conversion_weight: weights.conversion,
            transaction_weight: weights.transaction,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'preset_name'
        });
    
    if (error) throw error;
    return data;
}

// 初始化默认权重预设
export async function initializeDefaultWeightPresets() {
    const defaultPresets = [
        {
            preset_name: '曝光成交率优先',
            efficiency_weight: 15,
            exposure_weight: 35,
            conversion_weight: 35,
            transaction_weight: 15,
            is_default: true
        },
        {
            preset_name: '成交件数优先',
            efficiency_weight: 15,
            exposure_weight: 15,
            conversion_weight: 20,
            transaction_weight: 50,
            is_default: false
        },
        {
            preset_name: '讲解效率优先',
            efficiency_weight: 50,
            exposure_weight: 20,
            conversion_weight: 15,
            transaction_weight: 15,
            is_default: false
        },
        {
            preset_name: '自定义',
            efficiency_weight: 15,
            exposure_weight: 35,
            conversion_weight: 35,
            transaction_weight: 15,
            is_default: false
        }
    ];

    const { error } = await supabase
        .from('weight_presets')
        .upsert(defaultPresets, {
            onConflict: 'preset_name'
        });
    
    if (error) throw error;
} 