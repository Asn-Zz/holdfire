import { Sparkles, File, Book, Volume2, LockKeyhole, Library } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FooterInfo {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const INFOS: FooterInfo[] = [
    {
        title: '智能校对',
        description: '自动校对文章中的多种错误',
        icon: Sparkles,
    },
    {
        title: '文件识别',
        description: '支持处理多类型文件',
        icon: File,
    },
    {
        title: '词库管理',
        description: '自定义词库分组管理',
        icon: Book,
    },
    {
        title: '语音朗读',
        description: '选中文本后可进行朗读',
        icon: Volume2,
    },
    {
        title: '错误分类',
        description: '错误分类清晰，支持文本比对',
        icon: Library,
    },
    {
        title: '安全可靠',
        description: '全量数据本地存储，代码开源部署',
        icon: LockKeyhole,
    }
]

export function Footer() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>文章校对助手</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">文章校对助手是一款专为内容创作者设计的智能校对工具，能够帮助您快速校对文章。</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-6">
                    {INFOS.map((item) => (
                        <div key={item.title} className={`bg-blue-50 dark:bg-blue-950 p-4 rounded-lg`}>
                            <div className="flex items-center mb-3">
                                <div className={`w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300`}>
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <h3 className="ml-3 font-medium text-foreground">{item.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}