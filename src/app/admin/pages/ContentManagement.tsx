import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { ImageUpload } from "../../components/ImageUpload";

export function ContentManagement() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">CMS & Content</h2>
                <p className="text-muted-foreground">Manage website content and banners.</p>
            </div>

            <Tabs defaultValue="homepage" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger
                        value="homepage"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        Homepage
                    </TabsTrigger>
                    <TabsTrigger
                        value="about"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        About Us
                    </TabsTrigger>
                    <TabsTrigger
                        value="faq"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        FAQs
                    </TabsTrigger>
                    <TabsTrigger
                        value="legal"
                        className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-md"
                    >
                        Legal & Policies
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="homepage" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Section</CardTitle>
                            <CardDescription>
                                Update the main banner and introduction text.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="hero-title">Main Headline</Label>
                                <Input id="hero-title" defaultValue="Master CA, CS & CMA with India's Leading Coaching Institute" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hero-subtitle">Subtitle</Label>
                                <Textarea id="hero-subtitle" rows={3} defaultValue="50,000+ successful professionals started here. Expert faculty..." />
                            </div>
                            <div className="space-y-2">
                                <ImageUpload
                                    label="Hero Image"
                                    value="https://images.unsplash.com/photo-1523050854058-8df90110c9f1"
                                    onChange={() => { }}
                                    recommendedDimensions="1920 x 1080 px (16:9)"
                                />
                            </div>
                            <Button>Save Changes</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Announcement Bar</CardTitle>
                            <CardDescription>Top notification bar content.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="announcement">Message</Label>
                                <Input id="announcement" defaultValue="New batches starting Jan 15, 2024!" />
                            </div>
                            <Button>Update Announcement</Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="about">
                    <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">About Us editing coming soon.</p>
                    </div>
                </TabsContent>
                <TabsContent value="faq">
                    <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">FAQ editing coming soon.</p>
                    </div>
                </TabsContent>
                <TabsContent value="legal">
                    <div className="min-h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">Policy editing coming soon.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
