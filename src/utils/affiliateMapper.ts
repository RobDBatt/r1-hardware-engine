export interface UpgradeRecommendation {
    hardware: string;
    projectedTPSBoost: number;
    affiliateUrl: string;
}

export class AffiliateMapper {
    private static readonly REFS: Record<string, string> = {
        'RTX 4090': 'https://antigravity.ai/ref/rtx-4090',
        'RTX 6000 Ada': 'https://antigravity.ai/ref/rtx-6000-ada',
        'H100 Cloud': 'https://antigravity.ai/ref/h100-cloud'
    };

    static getRecommendation(currentVramGB: number, targetVramGB: number): UpgradeRecommendation {
        if (targetVramGB > 80) {
            return {
                hardware: 'H100 NVLink Cluster (Cloud Bursting)',
                projectedTPSBoost: 80,
                affiliateUrl: this.REFS['H100 Cloud']
            };
        } else if (targetVramGB > 24) {
            return {
                hardware: 'NVIDIA RTX 6000 Ada (48GB)',
                projectedTPSBoost: 45,
                affiliateUrl: this.REFS['RTX 6000 Ada']
            };
        } else {
            return {
                hardware: 'NVIDIA RTX 4090 (24GB)',
                projectedTPSBoost: 25,
                affiliateUrl: this.REFS['RTX 4090']
            };
        }
    }
}
