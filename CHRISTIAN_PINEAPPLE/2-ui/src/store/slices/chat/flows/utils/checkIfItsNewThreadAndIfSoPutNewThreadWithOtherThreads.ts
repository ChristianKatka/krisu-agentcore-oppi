export const checkIfItsNewThreadAndIfSoPutNewThreadWithOtherThreads = (
  thread: any,
  selectedThreadId: any,
  alreadyExistingThreads: any
) => {
  // jos selectedThreadId = undefined meinaa et on eka viesti jolloin
  if (!selectedThreadId) {
    return {
      ...alreadyExistingThreads,
      [thread.threadId]: thread,
    };
  }

  // jos on jo selectedThreadId se meinaa että keskustelu jatkuu kyseiseen ketjuun
  // tällöin voit vain palauttaa olemassa olevat threadit alreadyExistingThreads
  else {
    return alreadyExistingThreads;
  }
};
