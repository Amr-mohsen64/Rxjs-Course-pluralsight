import {
  Observable,
  concat,
  from,
  of,
  fromEvent,
  combineLatest,
  interval,
  EMPTY,
  throwError,
  Subject,
  BehaviorSubject,
  AsyncSubject,
  ReplaySubject,
  queueScheduler,
  asyncScheduler,
} from "rxjs";
import { ajax } from "rxjs/ajax";
import { allBooks, allReaders } from "./data";
import {
  filter,
  map,
  mergeMap,
  tap,
  catchError,
  take,
  takeUntil,
  multicast,
  refCount,
  publish,
  share,
  publishLast,
  publishBehavior,
  publishReplay,
  observeOn,
} from "rxjs/operators";

interface Book {
  title: string;
  bookID: number;
}

//#region creating observables
//#region creating an observable with the Observable constructor
let allBooksObservable$ = new Observable<any[]>((subscriber) => {
  if (document.title !== "RxBookTracker") {
    subscriber.error("incorrect page title");
  }

  allBooks.forEach((book) => subscriber.next(book));

  setTimeout(() => {
    subscriber.complete();
  }, 2000);

  return { unsubscribe() {} };
});

// when call subscribe() method, the subscribe() function is called with a Subscriber object
// allBooksObservable$.subscribe((book) => console.log(book.title));

//#endregion

//#region creating an observable with the Observable operators
let source1$ = of("hello", 10, true, allBooks[0].title);
// source1$.subscribe((value) => console.log(value));

let source2$ = from(allBooks);
// source2$.subscribe((book) => console.log(book.title));
//#endregion

//#region  combining observables with the concat() operator
// concat(source1$, source2$).subscribe((value) => console.log(value));
//#endregion

//#region creating an observable with the fromEvent() function
// let button = document.getElementById("readersButton");

// fromEvent(button, "click").subscribe((event) => {
//   let readersDiv = document.getElementById("readers");
//   for (let reader of allReaders) {
//     readersDiv.innerHTML += reader.name + "<br>";
//   }
// });
//#endregion

//#region creating an observable with the ajax() function
// let button = document.getElementById("readersButton");

// fromEvent(button, "click").subscribe((event) => {
//   ajax("/api/readers").subscribe((ajaxResponse) => {
//     let readers = ajaxResponse.response;
//     let readersDiv = document.getElementById("readers");
//     readers.forEach((reader) => {
//       readersDiv.innerHTML += reader.name + "<br>";
//     });
//   });
// });
//#endregion

//#endregion

//#region subscribing to observables with observers

let books$ = from(allBooks);
// let booksObserver = {
//   next: (book: Book) => console.log(`Title: ${book.title}`),
//   error: (err: string) => console.log(`Error: ${err}`),
//   complete: () => console.log("All done!"),
// };
// books$.subscribe(booksObserver);

//or
// books$.subscribe(
//   (book: Book) => console.log(`Title: ${book.title}`),
//   (err: string) => console.log(`Error: ${err}`),
//   () => console.log("All done!")
// );
// --------------------------------------------------------------------------------------------
// let currentTime$ = new Observable<string>((subscriber) => {
//   const timeString = new Date().toLocaleTimeString();
//   subscriber.next(timeString);
//   subscriber.complete();
// });

// currentTime$.subscribe((currentTime) =>
//   console.log(`Observer 1: ${currentTime}`)
// );

// setTimeout(() => {
//   currentTime$.subscribe((currentTime) =>
//     console.log(`Observer 2: ${currentTime}`)
//   );
// }, 1000);

// setTimeout(() => {
//   currentTime$.subscribe((currentTime) =>
//     console.log(`Observer 3: ${currentTime}`)
//   );
// }, 2000);

//each observer gets its own execution context (instance) of the observable
// --------------------------------------------------------------------------------------------

// let timesDiv = document.getElementById("times");
// let button = document.getElementById("timerButton");
// // let timer$ = interval(1000);

// let timer$ = new Observable<number>((subscriber) => {
//   let i = 0;
//   const intervalID = setInterval(() => {
//     subscriber.next(i++);
//   }, 1000);

//   return () => {
//     console.log("Executing teardown code.");
//     clearInterval(intervalID);
//   };
// });

// let timerSubscription = timer$.subscribe(
//   (value) => {
//     timesDiv.innerHTML += `${new Date().toLocaleTimeString()} (${value}) <br>`;
//   },
//   null,
//   () => console.log("All done!")
// );

// let timerConsoleSubscription = timer$.subscribe((value) =>
//   console.log(`${new Date().toLocaleTimeString()} (${value})`)
// );

// timerSubscription.add(timerConsoleSubscription);

// fromEvent(button, "click").subscribe((event) => {
//   timerSubscription.unsubscribe();
//   console.log("Timer Stopped");
// });
//#endregion

//#region operators
// let source3$ = of(1, 2, 3, 4, 5);
// let doubler = map((value: number) => value * 2);
// let doubled$ = doubler(source3$);
// doubled$.subscribe((value) => console.log(value));

// //new syntax
// source3$
//   .pipe(map((value: number) => value * 2))
//   .subscribe((value) => console.log(value));

//#endregion

//#region dealing with errors
// ajax("/api/errors/500")
//   .pipe(
//     mergeMap((ajaxResponse) => ajaxResponse.response),
//     filter((book: Book) => book.publicationYear < 1950),
//   // catchError((err) => of({ title: "Corduroy", bookID: 112233 })),
//     // catchError((err) => throw `something went wrong${err.message}` )
//     catchError((err) => throwError(err))
//   )
//   .subscribe(
//     (res) => {
//       console.log(res);
//     },
//     (error) => console.log(error)
//   );

//#endregion

//#region take , takeUntil observables
// let timesDiv = document.getElementById("times");
// let button = document.getElementById("timerButton");

// let timer$ = new Observable<number>((subscriber) => {
//   let i = 0;
//   const intervalID = setInterval(() => {
//     subscriber.next(i++);
//   }, 1000);

//   // completion handler
//   return () => {
//     console.log("Executing teardown code.");
//     clearInterval(intervalID);
//   };
// });

// let cancelTimer$ = fromEvent(button, "click");
// timer$
//   .pipe(
//     // take(3),
//     takeUntil(cancelTimer$)
//   )
//   .subscribe(
//     (value) => {
//       timesDiv.innerHTML += `${new Date().toLocaleTimeString()} (${value}) <br>`;
//     },
//     null,
//     () => console.log("All done!")
//   );

//#endregion

//#region create your own operator

/**
 * operator structure:
 * operators are functions that return a function and
 * that function returns an observable and this function takes an observable as an argument
 */
// function myOperator() {
//   return function(source: Observable<any>) {
//     return new Observable();
//   };
// }

// let source$ = of(1, 2, 3, 4, 5);
// let doubler = map((value: number) => value * 2); // this is an operator that returns a function
// let doubled$ = doubler(source$);  // when we call this function it returns an observable
// doubled$.subscribe((value) => console.log(value));

// --------------------------------------------------------------------------------------------
// ex:
// function doublerOperator() {
//   return map((value: number) => value * 2);
// }
// source$.pipe(doublerOperator()).subscribe((value) => console.log(value)); //2,4,6,8,10

// ex:2

// heres a logic that we may repeat in multiple places
// function grabAndLogClassics(year, log) {
//   return (source$) => {
//     // this is the function that returns an observable
//     return new Observable((subscriber) => {
//       return source$.subscribe(
//         // return here gives the ability to unsubscribe
//         (book: Book) => {
//           // filter operator logic
//           if (book.publicationYear < year) {
//             subscriber.next(book);
//             //tap operator logic
//             if (log) {
//               console.log(`Classic: ${book.title}`);
//             }
//           }
//         },
//         (err) => subscriber.error(err),
//         () => subscriber.complete()
//       );
//     });
//   };
// }

/**
 * we can refactor filter and tap operators into a custom operator
 * and use it custom operator
 *  */

// ajax("/api/books")
//   .pipe(
//     mergeMap((ajaxResponse) => ajaxResponse.response),
//     // filter((book: Book) => book.publicationYear < 1950),
//     // tap((oldBook) => console.log(`Title: ${oldBook.title}`)),
//     // grabAndLogClassics(1950, true)
//     grabAndLogClassicsWithPipe(1950, true)
//   )
//   .subscribe(
//     (book) => {
//       console.log(book.title);
//     },
//     (error) => console.log(error)
//   );

// also we may wrap the built-in operators in a custom operator
// function grabClassics(year) {
//   return filter((book: Book) => book.publicationYear < year);
// }

// function grabAndLogClassicsWithPipe(year, log) {
//   return (source$) =>
//     source$.pipe(
//       grabClassics(year),
//       tap((oldBook) => log? console.log(`Title: ${oldBook.title}`: null))
//     );
// }
//#endregion

// --------------------------------------------------------------------------------------------
//#region Subjects
// subjects are multicast observables
// let subject$ = new Subject();

// subject$.subscribe({
//   next: (value) => console.log(`Observer 1: ${value}`),
// });

// subject$.subscribe({
//   next: (value) => console.log(`Observer 2: ${value}`),
// });

// subject$.next("Hello!"); // when we next in subject the subject will loop over all observers  adn push the value to them

// console.log(subject$.observers);

// let source$ = new Observable((subscriber) => {
//   subscriber.next("Greetings!");
// });

// source$.subscribe(subject$); // we can pass a subject as an observer
//#endregion

//#region cold and hot observables
// cold observable example that each observer gets its own execution context (unicast)

// let source$ = interval(1000).pipe(take(4));

// source$.subscribe((value) => console.log(`Observer 1: ${value}`));

// setTimeout(() => {
//   source$.subscribe((value) => console.log(`Observer 2: ${value}`));
// }, 2000);

// setTimeout(() => {
//   source$.subscribe((value) => console.log(`Observer 3: ${value}`));
// }, 3000);

// --------------------------------------------------------------------------------------------
// make it multicast (hot observable) bu using a subject
//let source$ = interval(1000).pipe(take(4));

// when a source produces a value, it will be pushed to the subject and the subject will push it to all observers (multicast) it as graph in course
//let subject$ = new Subject();
//source$.subscribe(subject$);
//subject$.subscribe((value) => console.log(`Observer 1: ${value}`));

//setTimeout(() => {//
// subject$.subscribe((value) => console.log(`Observer 2: ${value}`));
//}, 2000);

//setTimeout(() => {
//  subject$.subscribe((value) => console.log(`Observer 3: ${value}`));
//}, 3000);

// --------------------------------------------------------------------------------------------
// make it multicast (hot observable) by using  multicast operators
let source$ = interval(1000).pipe(
  take(4),
  // multicast(new Subject()),
  // publish() // same as multiCast but don't need to pass a subject , it will create a subject internally
  // publishLast(), // same as publish() , it use asyncSubject behavior, it waits for all values to be emitted before sending the last value
  // publishBehavior(5000) // same as publish() , and behaves like BehaviorSubject, it takes an initial value and sends it to the observers
   publishReplay() // same as publish(), it use ReplaySubject behavior , all observers will get all values that have been emitted(replayed)
   refCount() // add it instead of calling connect() method , this will automatically call connect() when the first observer subscribes and disconnect when the last observer unsubscribes
   share() // same as publish().refCount(), when use share the 4th observer will make new execution context of the observable , because 4th subscribes after emitting all values, instead of sending error or completion message
);

// let source$ = new AsyncSubject();
// let sub2$ = new ReplaySubject();
// source$.subscribe(sub2$);

source$.subscribe((value) => console.log(`Observer 1: ${value}`));

setTimeout(() => {
  source$.subscribe((value) => console.log(`Observer 2: ${value}`));
}, 2000);

setTimeout(() => {
  source$.subscribe((value) => console.log(`Observer 3: ${value}`));
}, 3000);

setTimeout(() => {
  source$.subscribe((value) => console.log(`Observer 4: ${value}`), null, () =>
    console.log("Observer 4 completed")
  );
}, 4500);

// source$.connect(); // multicast is connectable observable that wont start emitting values until we call connect() method
//#endregion
// --------------------------------------------------------------------------------------------
//#region schedulers

console.log("Start script");
from([1, 2, 3, 4], ).pipe(
  tap((value) => console.log(`Value: ${value}`)),
  observeOn(asyncScheduler), // when we want to make extensive calculations in pipe line and we don't want to block the main thread
  tap((value) => console.log(`Double value: ${value * 2}`))
).subscribe();
console.log("End script");
//#endregion
