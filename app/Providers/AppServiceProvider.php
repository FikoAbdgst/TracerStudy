<?php

namespace App\Providers;

use App\Models\ForumReply;
use App\Models\ForumTopic;
use App\Models\Message;
use App\Policies\ForumReplyPolicy;
use App\Policies\ForumTopicPolicy;
use App\Policies\MessagePolicy;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(ForumTopic::class, ForumTopicPolicy::class);
        Gate::policy(ForumReply::class, ForumReplyPolicy::class);
        Gate::policy(Message::class, MessagePolicy::class);

        Model::preventLazyLoading(! $this->app->isProduction());

        Vite::prefetch(concurrency: 3);
    }
}
