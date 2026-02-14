import Array "mo:core/Array";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Setup Access Control and Storage
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  type UploadReference = {
    id : Text;
    blob : Storage.ExternalBlob;
    name : Text;
    contentType : Text;
    size : Nat;
    timestamp : Time.Time;
    owner : Principal;
  };

  let uploads = Map.empty<Principal, List.List<UploadReference>>();
  let logs = Map.empty<Principal, List.List<LogEntry>>();
  let questions = Map.empty<Principal, List.List<Question>>();

  // Log Entry Types
  type LogEntry = {
    id : Text;
    timestamp : Time.Time;
    title : ?Text;
    notes : Text;
    mileage : ?Int;
    owner : Principal;
  };

  // Question Types
  type Question = {
    id : Text;
    questionText : Text;
    timestamp : Time.Time;
    status : QuestionStatus;
    adminReply : ?Text;
    owner : Principal;
  };

  type QuestionStatus = {
    #open;
    #answered;
  };

  module LogEntry {
    public func compareByTime(log1 : LogEntry, log2 : LogEntry) : Order.Order {
      Int.compare(log1.timestamp, log2.timestamp);
    };

    public func compareByMileage(log1 : LogEntry, log2 : LogEntry) : Order.Order {
      switch (log1.mileage, log2.mileage) {
        case (?m1, ?m2) { Int.compare(m1, m2) };
        case (?_, null) { #less };
        case (null, ?_) { #greater };
        case (null, null) { #equal };
      };
    };
  };

  module Question {
    public func compareByTime(q1 : Question, q2 : Question) : Order.Order {
      Int.compare(q1.timestamp, q2.timestamp);
    };
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Truck Logging Functions
  public shared ({ caller }) func createLogEntry(title : ?Text, notes : Text, mileage : ?Int) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create logs");
    };
    let logEntry : LogEntry = {
      id = Time.now().toText();
      timestamp = Time.now();
      title;
      notes;
      mileage;
      owner = caller;
    };
    let userLogs = switch (logs.get(caller)) {
      case (null) { List.empty<LogEntry>() };
      case (?existing) { existing };
    };
    userLogs.add(logEntry);
    logs.add(caller, userLogs);
    logEntry.id;
  };

  public shared ({ caller }) func updateLogEntry(logId : Text, title : ?Text, notes : Text, mileage : ?Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update logs");
    };
    switch (logs.get(caller)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let logArray = userLogs.toArray();
        let index = logArray.findIndex(func(log) { log.id == logId });
        switch (index) {
          case (null) { Runtime.trap("Log not found") };
          case (?_) {
            let filtered = logArray.map(
              func(log) {
                if (log.id == logId) {
                  return {
                    id = log.id;
                    timestamp = log.timestamp;
                    title;
                    notes;
                    mileage;
                    owner = caller;
                  };
                };
                log;
              }
            );
            userLogs.clear();
            userLogs.addAll(filtered.values());
            logs.add(caller, userLogs);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteLogEntry(logId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete logs");
    };
    switch (logs.get(caller)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let logArray = userLogs.toArray();
        let filtered = logArray.filter(func(log) { log.id != logId });
        if (filtered.size() == logArray.size()) {
          Runtime.trap("Log not found");
        };
        userLogs.clear();
        userLogs.addAll(filtered.values());
        logs.add(caller, userLogs);
      };
    };
  };

  public query ({ caller }) func getCallerLogEntries() : async [LogEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view logs");
    };
    switch (logs.get(caller)) {
      case (null) { [] };
      case (?userLogs) { userLogs.toArray() };
    };
  };

  public query ({ caller }) func getUserLogEntry(user : Principal, logId : Text) : async LogEntry {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own logs");
    };
    switch (logs.get(user)) {
      case (null) { Runtime.trap("No logs found") };
      case (?userLogs) {
        let entryOpt = userLogs.find(func(log) { log.id == logId });
        switch (entryOpt) {
          case (null) { Runtime.trap("Log not found") };
          case (?log) { log };
        };
      };
    };
  };

  public query ({ caller }) func getAllLogEntries() : async [(Principal, [LogEntry])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all logs");
    };
    let entries = Map.empty<Principal, [LogEntry]>();
    for ((principal, userLogs) in logs.entries()) {
      entries.add(principal, userLogs.toArray());
    };
    entries.toArray();
  };

  // Document Upload Functions
  public shared ({ caller }) func uploadDocument(blob : Storage.ExternalBlob, name : Text, contentType : Text, size : Nat) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload documents");
    };
    let reference : UploadReference = {
      id = Time.now().toText();
      blob;
      name;
      contentType;
      size;
      timestamp = Time.now();
      owner = caller;
    };
    let userUploads = switch (uploads.get(caller)) {
      case (null) { List.empty<UploadReference>() };
      case (?existing) { existing };
    };
    userUploads.add(reference);
    uploads.add(caller, userUploads);
    reference.id;
  };

  public query ({ caller }) func getCallerUploads() : async [UploadReference] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view uploads");
    };
    switch (uploads.get(caller)) {
      case (null) { [] };
      case (?userUploads) { userUploads.toArray() };
    };
  };

  public query ({ caller }) func getUserUpload(user : Principal, uploadId : Text) : async UploadReference {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own uploads");
    };
    switch (uploads.get(user)) {
      case (null) { Runtime.trap("No uploads found") };
      case (?userUploads) {
        let referenceOpt = userUploads.find(func(upload) { upload.id == uploadId });
        switch (referenceOpt) {
          case (null) { Runtime.trap("Upload not found") };
          case (?reference) { reference };
        };
      };
    };
  };

  public query ({ caller }) func getAllUploads() : async [(Principal, [UploadReference])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all uploads");
    };
    let entries = Map.empty<Principal, [UploadReference]>();
    for ((principal, userUploads) in uploads.entries()) {
      entries.add(principal, userUploads.toArray());
    };
    entries.toArray();
  };

  // Question Functions
  public shared ({ caller }) func submitQuestion(questionText : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit questions");
    };
    let question : Question = {
      id = Time.now().toText();
      questionText;
      timestamp = Time.now();
      status = #open;
      adminReply = null;
      owner = caller;
    };
    let userQuestions = switch (questions.get(caller)) {
      case (null) { List.empty<Question>() };
      case (?existing) { existing };
    };
    userQuestions.add(question);
    questions.add(caller, userQuestions);
    question.id;
  };

  public shared ({ caller }) func updateQuestionStatus(user : Principal, questionId : Text, status : QuestionStatus) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update question status");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionArray = userQuestions.toArray();
        let index = questionArray.findIndex(func(q) { q.id == questionId });
        switch (index) {
          case (null) { Runtime.trap("Question not found") };
          case (?_) {
            let filtered = questionArray.map(
              func(q) {
                if (q.id == questionId) {
                  return { q with status };
                };
                q;
              }
            );
            userQuestions.clear();
            userQuestions.addAll(filtered.values());
            questions.add(user, userQuestions);
          };
        };
      };
    };
  };

  public shared ({ caller }) func answerQuestion(user : Principal, questionId : Text, reply : Text) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can answer questions");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionArray = userQuestions.toArray();
        let index = questionArray.findIndex(func(q) { q.id == questionId });
        switch (index) {
          case (null) { Runtime.trap("Question not found") };
          case (?_) {
            let filtered = questionArray.map(
              func(q) {
                if (q.id == questionId) {
                  return {
                    q with
                    status = #answered;
                    adminReply = ?reply;
                  };
                };
                q;
              }
            );
            userQuestions.clear();
            userQuestions.addAll(filtered.values());
            questions.add(user, userQuestions);
          };
        };
      };
    };
  };

  public query ({ caller }) func getCallerQuestions() : async [Question] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view questions");
    };
    switch (questions.get(caller)) {
      case (null) { [] };
      case (?userQuestions) { userQuestions.toArray() };
    };
  };

  public query ({ caller }) func getUserQuestion(user : Principal, questionId : Text) : async Question {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own questions");
    };
    switch (questions.get(user)) {
      case (null) { Runtime.trap("No questions found") };
      case (?userQuestions) {
        let questionOpt = userQuestions.find(func(q) { q.id == questionId });
        switch (questionOpt) {
          case (null) { Runtime.trap("Question not found") };
          case (?question) { question };
        };
      };
    };
  };

  public query ({ caller }) func getAllQuestions() : async [(Principal, [Question])] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all questions");
    };
    let entries = Map.empty<Principal, [Question]>();
    for ((principal, userQuestions) in questions.entries()) {
      entries.add(principal, userQuestions.toArray());
    };
    entries.toArray();
  };
};
