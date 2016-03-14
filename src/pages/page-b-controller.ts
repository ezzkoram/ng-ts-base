module pages {
    export class PageBController {
        public static $inject: string[] = ['$timeout'];

        private counter: number = 0;

        constructor(private $timeout: ng.ITimeoutService) {
            this.setupTimeout();
        }

        private setupTimeout() {
            this.$timeout(() => {
                this.counter++;
                this.setupTimeout();
            }, 500);
        }

        protected reset() {
            this.counter = 0;
        }
    }
}
